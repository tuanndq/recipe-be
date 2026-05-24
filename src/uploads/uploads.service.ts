import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { FileStorage } from './interfaces/file-storage.interface';
import { ImageConverterService } from './services/image-converter.service';
import { FILE_STORAGE } from './uploads.constants';

@Injectable()
export class UploadsService {
  constructor(
    @Inject(FILE_STORAGE) private readonly fileStorage: FileStorage,
    private readonly imageConverter: ImageConverterService,
  ) {}

  getPublicUrl(filename: string): string {
    return this.fileStorage.toPublicUrl(filename);
  }

  listFiles() {
    return this.fileStorage.list();
  }

  async uploadImage(file: Express.Multer.File) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Image file is required');
    }

    const webpBuffer = await this.imageConverter.toWebp(file.buffer);
    const saved = await this.fileStorage.saveImage(webpBuffer, file.originalname);

    return {
      filename: saved.filename,
      url: saved.url,
      originalName: file.originalname,
      size: saved.size,
      format: 'webp',
    };
  }
}
