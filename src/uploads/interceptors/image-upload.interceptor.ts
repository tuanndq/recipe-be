import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageUploadMulterOptionsFactory } from '../multer/image-upload-multer.factory';

@Injectable()
export class ImageUploadInterceptor implements NestInterceptor {
  private readonly delegate: NestInterceptor;

  constructor(factory: ImageUploadMulterOptionsFactory) {
    const InterceptorClass = FileInterceptor(
      'file',
      factory.create(),
    ) as Type<NestInterceptor>;
    this.delegate = new InterceptorClass();
  }

  intercept(context: ExecutionContext, next: CallHandler) {
    return this.delegate.intercept(context, next);
  }
}
