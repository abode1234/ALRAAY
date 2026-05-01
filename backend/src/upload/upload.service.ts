import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

@Injectable()
export class UploadService {
  private readonly uploadPath = path.join(process.cwd(), 'images');

  constructor(private prisma: PrismaService) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    type: 'product' | 'icon' | 'banner' = 'product',
  ): Promise<{
    id: string;
    filename: string;
    path: string;
    url: string;
    mimetype: string;
    size: number;
    width: number | null;
    height: number | null;
  }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed',
      );
    }

    try {
      // Process image with sharp
      let sharpInstance = sharp(file.buffer);
      const metadata = await sharpInstance.metadata();

      if (type === 'icon') {
        // Icons: 120px width, restrict height, maintain transparency
        sharpInstance = sharpInstance
          .resize({ width: 120, withoutEnlargement: true })
          .webp({ quality: 90, lossless: true });
      } else if (type === 'banner') {
        // Banners: 4K width (3840px) for high-quality display on large screens
        sharpInstance = sharpInstance
          .resize({ width: 3840, withoutEnlargement: true })
          .webp({ quality: 95 });
      } else {
        // Products (default): 800px width
        sharpInstance = sharpInstance
          .resize({ width: 800, withoutEnlargement: true })
          .webp({ quality: 80 });
      }

      const processedBuffer = await sharpInstance.toBuffer();
      const processedMetadata = await sharp(processedBuffer).metadata();

      // Generate unique filename with .webp extension
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      // Simplify original name for safety
      const safeName = file.originalname
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/\.[^/.]+$/, '');
      const filename = `${timestamp}-${safeName}-${randomString}.webp`;
      const filePath = path.join(this.uploadPath, filename);

      // Write file to disk
      fs.writeFileSync(filePath, processedBuffer);

      // Generate URL path
      const urlPath = `/images/${filename}`;
      // Use API_URL (e.g. https://domain.com/api)
      // We must keep the /api prefix so requests are routed to the backend by Nginx.
      // Nginx strips /api, so the backend receives /images/filename.webp, which matches ServeStaticModule.
      const baseUrl = process.env.API_URL || 'https://alraay.net/api';

      // Ensure no double slashes
      const cleanBase = baseUrl.replace(/\/+$/, '');
      const fullUrl = `${cleanBase}${urlPath}`;

      // Save to database
      const image = await this.prisma.image.create({
        data: {
          filename: filename,
          path: urlPath,
          url: fullUrl,
          mimetype: 'image/webp',
          size: processedBuffer.length,
          width: processedMetadata.width,
          height: processedMetadata.height,
        },
      });

      return image;
    } catch (error) {
      console.error('Image processing error:', error);
      throw new BadRequestException('Failed to process image');
    }
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    type: 'product' | 'icon' | 'banner' = 'product',
  ): Promise<
    Array<{
      id: string;
      filename: string;
      path: string;
      url: string;
      mimetype: string;
      size: number;
    }>
  > {
    const results: Array<{
      id: string;
      filename: string;
      path: string;
      url: string;
      mimetype: string;
      size: number;
    }> = [];
    for (const file of files) {
      const result = await this.uploadImage(file, type);
      results.push(result);
    }
    return results;
  }

  async getImage(id: string) {
    return this.prisma.image.findUnique({
      where: { id },
    });
  }

  async getAllImages() {
    return this.prisma.image.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteImage(id: string) {
    const image = await this.prisma.image.findUnique({
      where: { id },
    });

    if (!image) {
      throw new BadRequestException('Image not found');
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), image.path.replace(/^\//, '')); // Remove leading slash for join
    // OR if path is stored as relative path like /images/foo.webp, and uploadPath is process.cwd()/images
    // then image.path is actually relative to root if it starts with slash.
    // Let's use the same logic as constructor: process.cwd() + image.path (if it includes /images)
    // Actually in uploadImage we did: path = urlPath = `/images/${filename}`
    // So `path.join(process.cwd(), image.path)` should be correct: /home/.../backend/images/foo.webp

    const absoluteFilePath = path.join(process.cwd(), image.path);

    if (fs.existsSync(absoluteFilePath)) {
      try {
        fs.unlinkSync(absoluteFilePath);
      } catch (e) {
        console.error('Error deleting file:', e);
      }
    }

    // Delete from database
    return this.prisma.image.delete({
      where: { id },
    });
  }

  // Link image to product
  async linkImageToProduct(
    imageId: string,
    productId: string,
    order: number = 0,
  ) {
    return this.prisma.productImage.create({
      data: {
        imageId,
        productId,
        order,
      },
      include: {
        image: true,
      },
    });
  }

  // Unlink image from product
  async unlinkImageFromProduct(imageId: string, productId: string) {
    return this.prisma.productImage.delete({
      where: {
        productId_imageId: {
          productId,
          imageId,
        },
      },
    });
  }

  // Link image to banner
  async linkImageToBanner(imageId: string, bannerId: string) {
    return this.prisma.banner.update({
      where: { id: bannerId },
      data: { imageId },
      include: { image: true },
    });
  }

  // Link image to brand (as logo)
  async linkImageToBrand(imageId: string, brandId: string) {
    return this.prisma.brand.update({
      where: { id: brandId },
      data: { logoId: imageId },
      include: { logoImage: true },
    });
  }
}

