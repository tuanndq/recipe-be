import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { createImageUploadMulterOptions } from './image-upload.multer';

@Injectable()
export class ImageUploadMulterOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  create(): MulterOptions {
    return createImageUploadMulterOptions(this.config);
  }
}
