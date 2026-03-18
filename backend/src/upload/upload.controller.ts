import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // Upload single image
  @Post('single')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
      },
    }),
  )
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { type?: 'product' | 'icon' },
  ) {
    return this.uploadService.uploadImage(file, body.type);
  }

  // Upload multiple images
  @Post('multiple')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max per file
      },
    }),
  )
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { type?: 'product' | 'icon' },
  ) {
    return this.uploadService.uploadMultipleImages(files, body.type);
  }

  // Get all images
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllImages() {
    return this.uploadService.getAllImages();
  }

  // Get single image
  @Get(':id')
  async getImage(@Param('id') id: string) {
    return this.uploadService.getImage(id);
  }

  // Delete image
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteImage(@Param('id') id: string) {
    return this.uploadService.deleteImage(id);
  }

  // Link image to product
  @Post('link/product')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async linkToProduct(
    @Body() body: { imageId: string; productId: string; order?: number },
  ) {
    return this.uploadService.linkImageToProduct(
      body.imageId,
      body.productId,
      body.order || 0,
    );
  }

  // Unlink image from product
  @Delete('unlink/product')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async unlinkFromProduct(
    @Body() body: { imageId: string; productId: string },
  ) {
    return this.uploadService.unlinkImageFromProduct(body.imageId, body.productId);
  }

  // Link image to banner
  @Post('link/banner')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async linkToBanner(@Body() body: { imageId: string; bannerId: string }) {
    return this.uploadService.linkImageToBanner(body.imageId, body.bannerId);
  }

  // Link image to brand
  @Post('link/brand')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async linkToBrand(@Body() body: { imageId: string; brandId: string }) {
    return this.uploadService.linkImageToBrand(body.imageId, body.brandId);
  }
}
