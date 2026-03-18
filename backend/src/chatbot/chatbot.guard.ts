import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatbotAuthGuard implements CanActivate {
    constructor(private configService: ConfigService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid authorization header');
        }

        const token = authHeader.split(' ')[1];
        const expectedToken = this.configService.get<string>('CHATBOT_API_TOKEN');

        if (!expectedToken) {
            throw new UnauthorizedException('Server configuration error: Chatbot token not set');
        }

        if (token !== expectedToken) {
            throw new UnauthorizedException('Invalid chatbot token');
        }

        // Attach a mock user object with the CHATBOT role so downstream code knows the context
        request.user = { role: 'CHATBOT' };
        return true;
    }
}
