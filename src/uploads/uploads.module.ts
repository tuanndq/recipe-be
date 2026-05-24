import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FILE_STORAGE } from './uploads.constants';
import { ImageUploadInterceptor } from './interceptors/image-upload.interceptor';
import { ImageUploadMulterOptionsFactory } from './multer/image-upload-multer.factory';
import { ImageConverterService } from './services/image-converter.service';
import { LocalFileStorage } from './storage/local-file.storage';
import { S3FileStorage } from './storage/s3-file.storage';
import { UploadsAdminController } from './uploads-admin.controller';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  imports: [ConfigModule],
  controllers: [UploadsController, UploadsAdminController],
  providers: [
    UploadsService,
    ImageConverterService,
    LocalFileStorage,
    S3FileStorage,
    ImageUploadMulterOptionsFactory,
    ImageUploadInterceptor,
    {
      provide: FILE_STORAGE,
      inject: [ConfigService, LocalFileStorage, S3FileStorage],
      useFactory: (
        config: ConfigService,
        local: LocalFileStorage,
        s3: S3FileStorage,
      ) => {
        const driver = config.get<string>('STORAGE_DRIVER', 'local');
        return driver === 's3' ? s3 : local;
      },
    },
  ],
  exports: [UploadsService, FILE_STORAGE],
})
export class UploadsModule {}
