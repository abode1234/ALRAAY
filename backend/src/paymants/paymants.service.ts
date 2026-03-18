import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadGatewayException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymantsDto } from './dto/create-paymant.dto';
import { SindiPayPayment } from './interfaces/SindiPayPayment.interface';
import {
  Payment,
  PaymentStatus,
  OrderStatus,
  Prisma,
} from '../../generated/prisma/client';

const SINDIPAY_STATUS_MAP: Record<string, PaymentStatus> = {
  CREATED: PaymentStatus.CREATED,
  PAID: PaymentStatus.PAID,
  FAILED: PaymentStatus.FAILED,
  EXPIRED: PaymentStatus.EXPIRED,
  CANCELLED: PaymentStatus.CANCELLED,
};

export type InitiatePaymentDto = CreatePaymantsDto & { orderId: string };

@Injectable()
export class PaymantsService {
  private readonly logger = new Logger(PaymantsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) { }

  private mapSindiPayStatus(
    status: string,
    fallback: PaymentStatus,
  ): PaymentStatus {
    const mapped = SINDIPAY_STATUS_MAP[status];
    if (!mapped) {
      this.logger.warn(
        `Unknown SindiPay status received: "${status}", using fallback: ${fallback}`,
      );
      return fallback;
    }
    return mapped;
  }

  private logSindiPayError(axiosError: AxiosError<any>): void {
    // Only log status + safe message — never log headers or full response to avoid API key leaks
    this.logger.error(
      `SindiPay API error — status: ${axiosError?.response?.status}, message: ${axiosError?.response?.data?.detail ?? axiosError?.message}`,
    );
  }

  /**
   * Sync local DB from SindiPay provider (source of truth).
   * Calls GET /api/v1/payments/gateway/{sindiPayId}/, updates the local
   * Payment record and, if PAID, marks the Order as PROCESSING.
   */
  private async syncFromProvider(
    sindiPayId: number,
  ): Promise<SindiPayPayment> {
    const baseUrl = this.configService.get<string>('SINDIPAY_BASE_URL');
    const apiKey = this.configService.get<string>('SINDIPAY_API_KEY');

    let sindiPayResponse: SindiPayPayment;

    try {
      const response = await firstValueFrom<AxiosResponse<SindiPayPayment>>(
        this.httpService.get<SindiPayPayment>(
          `${baseUrl}/api/v1/payments/gateway/${sindiPayId}/`,
          {
            headers: {
              'X-API-Key': apiKey,
            },
          },
        ),
      );
      sindiPayResponse = response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        axiosError?.response?.data?.detail ||
        axiosError?.response?.data?.message ||
        'SindiPay API call failed';
      this.logSindiPayError(axiosError);
      throw new BadGatewayException(message);
    }

    const mappedStatus = this.mapSindiPayStatus(
      sindiPayResponse.status,
      PaymentStatus.PENDING,
    );

    // Update local payment record to match provider state
    await this.prisma.payment.update({
      where: { sindiPayId },
      data: { status: mappedStatus },
    });

    // If PAID, promote the order to PROCESSING
    if (mappedStatus === PaymentStatus.PAID) {
      const payment = await this.prisma.payment.findUnique({
        where: { sindiPayId },
      });
      if (payment) {
        await this.prisma.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.PROCESSING },
        });
        this.logger.log(
          `Order ${payment.orderId} updated to PROCESSING after payment ${sindiPayId} was PAID`,
        );
      }
    }

    // If FAILED / EXPIRED / CANCELLED, mark the order as CANCELLED
    if (
      mappedStatus === PaymentStatus.FAILED ||
      mappedStatus === PaymentStatus.EXPIRED ||
      mappedStatus === PaymentStatus.CANCELLED
    ) {
      const payment = await this.prisma.payment.findUnique({
        where: { sindiPayId },
      });
      if (payment) {
        await this.prisma.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.CANCELLED },
        });
        this.logger.log(
          `Order ${payment.orderId} updated to CANCELLED after payment ${sindiPayId} was ${mappedStatus}`,
        );
      }
    }

    return sindiPayResponse;
  }

  async initiatePayment(
    userId: string,
    dto: InitiatePaymentDto,
  ): Promise<{ payment: Payment; redirectUrl: string }> {
    // Step 1: Verify the order exists and belongs to the user
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    // Step 2: Atomically reserve the payment slot via unique constraint on orderId
    let payment: Payment;

    try {
      payment = await this.prisma.payment.create({
        data: {
          userId,
          orderId: dto.orderId,
          amount: order.totalAmount,
          currency: 'IQD',
          title: dto.title,
          locale: dto.locale ?? 'ar',
          status: PaymentStatus.PENDING,
          metadata: dto.meta_data ?? Prisma.JsonNull,
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        // Another request already reserved this orderId — inspect existing record
        const existing = await this.prisma.payment.findUnique({
          where: { orderId: dto.orderId },
        });

        if (!existing) {
          // Extremely unlikely: constraint fired but record vanished
          throw new ConflictException('Payment conflict, please retry');
        }

        if (existing.sindiPayId) {
          // Existing record reached SindiPay — sync from provider to get real state
          const sindiData = await this.syncFromProvider(existing.sindiPayId);

          if (
            sindiData.status === 'PAID' ||
            sindiData.status === 'CREATED'
          ) {
            throw new ConflictException({
              message: `Payment already ${sindiData.status.toLowerCase()}`,
              redirectUrl:
                sindiData.status === 'CREATED' ? sindiData.url : undefined,
              status: sindiData.status,
            });
          }

          // FAILED / EXPIRED / CANCELLED — previous attempt is dead, allow re-initiation
          payment = existing;
        } else {
          // PENDING with no sindiPayId — orphaned (crashed before saving sindiPayId)
          payment = existing;
        }
      } else {
        throw err;
      }
    }

    // Step 3: Build SindiPay request body
    const baseUrl = this.configService.get<string>('SINDIPAY_BASE_URL');
    const apiKey = this.configService.get<string>('SINDIPAY_API_KEY');

    const callbackUrl =
      dto.callback_url ||
      `${this.configService.get<string>('SINDIPAY_CALLBACK_URL')}/${dto.orderId}`;

    const webhookUrl =
      dto.webhook_url ||
      this.configService.get<string>('SINDIPAY_WEBHOOK_URL');

    const requestBody = {
      title: dto.title,
      order_id: dto.orderId,
      total_amount: Number(order.totalAmount).toFixed(2),
      currency: dto.currency || 'IQD',
      locale: dto.locale || 'ar',
      callback_url: callbackUrl,
      ...(webhookUrl && { webhook_url: webhookUrl }),
      ...(dto.meta_data && { meta_data: dto.meta_data }),
    };

    // Step 4: Call SindiPay POST /api/v1/payments/gateway/
    let sindiPayResponse: SindiPayPayment;

    try {
      const response = await firstValueFrom<AxiosResponse<SindiPayPayment>>(
        this.httpService.post<SindiPayPayment>(
          `${baseUrl}/api/v1/payments/gateway/`,
          requestBody,
          {
            headers: {
              'X-API-Key': apiKey,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      sindiPayResponse = response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        axiosError?.response?.data?.detail ||
        axiosError?.response?.data?.message ||
        'SindiPay API call failed';

      // Mark payment as FAILED so next retry is allowed
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });

      // Also cancel the order
      await this.prisma.order.update({
        where: { id: dto.orderId },
        data: { status: OrderStatus.CANCELLED },
      });
      this.logger.log(
        `Order ${dto.orderId} cancelled after SindiPay API failure`,
      );

      this.logSindiPayError(axiosError);
      throw new BadGatewayException(message);
    }

    // Step 5: Update payment record with sindiPayId, sindiPayUrl, real status
    const resolvedStatus = this.mapSindiPayStatus(
      sindiPayResponse.status,
      PaymentStatus.CREATED,
    );

    const [updatedPayment] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          sindiPayId: sindiPayResponse.id,
          sindiPayUrl: sindiPayResponse.url,
          status: resolvedStatus,
        },
      }),
      this.prisma.order.update({
        where: { id: dto.orderId },
        data: { status: OrderStatus.AWAITING_PAYMENT },
      }),
    ]);

    // Step 6: Return payment + redirect URL
    return { payment: updatedPayment, redirectUrl: sindiPayResponse.url };
  }

  async retrievePayment(
    sindiPayId: number,
    userId: string,
  ): Promise<SindiPayPayment> {
    // Verify the payment exists and belongs to the user
    const localPayment = await this.prisma.payment.findFirst({
      where: { sindiPayId, userId },
    });

    if (!localPayment) {
      throw new NotFoundException('Payment not found');
    }

    // Sync from provider (updates local DB) and return fresh SindiPay data
    return this.syncFromProvider(sindiPayId);
  }

  async handleWebhook(body: SindiPayPayment): Promise<{ received: boolean }> {
    if (!body || !body.id) {
      this.logger.warn('Received webhook with no payment ID');
      return { received: true };
    }

    const sindiPayId = Number(body.id);
    const sindiPayStatus: string = body.status;

    const payment = await this.prisma.payment.findUnique({
      where: { sindiPayId },
    });

    if (!payment) {
      this.logger.warn(
        `Webhook received for unknown sindiPayId: ${sindiPayId}`,
      );
      return { received: true };
    }

    const mappedStatus = this.mapSindiPayStatus(sindiPayStatus, payment.status);

    // Validate amount matches what we have on record (prevents fraud via forged webhooks)
    if (
      body.total_amount &&
      Number(body.total_amount) !== Number(payment.amount)
    ) {
      this.logger.error(
        `Amount mismatch for sindiPayId ${sindiPayId}: expected ${payment.amount}, got ${body.total_amount}`,
      );
      return { received: true };
    }

    await this.prisma.payment.update({
      where: { sindiPayId },
      data: { status: mappedStatus },
    });

    // If status is PAID, update the related Order status to PROCESSING
    if (mappedStatus === PaymentStatus.PAID) {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.PROCESSING },
      });
      this.logger.log(
        `Order ${payment.orderId} updated to PROCESSING after payment ${sindiPayId} was PAID`,
      );
    }

    // If FAILED / EXPIRED / CANCELLED, mark the order as CANCELLED
    if (
      mappedStatus === PaymentStatus.FAILED ||
      mappedStatus === PaymentStatus.EXPIRED ||
      mappedStatus === PaymentStatus.CANCELLED
    ) {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.CANCELLED },
      });
      this.logger.log(
        `Order ${payment.orderId} updated to CANCELLED after payment ${sindiPayId} was ${mappedStatus}`,
      );
    }

    return { received: true };
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: { userId },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Public endpoint: sync from SindiPay and return only status.
   * Used by the payment-callback page after SindiPay redirect.
   */
  async getPaymentStatus(
    sindiPayId: number,
  ): Promise<{ status: string; orderId: string | null }> {
    const payment = await this.prisma.payment.findUnique({
      where: { sindiPayId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Sync from provider to get real-time status and update DB
    const sindiPayData = await this.syncFromProvider(sindiPayId);

    return {
      status: sindiPayData.status,
      orderId: payment.orderId,
    };
  }
}
