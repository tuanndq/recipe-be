import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';

@Injectable()
export class ImageConverterService {
  private readonly logger = new Logger(ImageConverterService.name);

  constructor(private readonly config: ConfigService) {}

  isEnabled(): boolean {
    return this.config.get<string>('IMAGE_CONVERT_TO_WEBP', 'true') !== 'false';
  }

  async toWebp(input: Buffer): Promise<Buffer> {
    if (!this.isEnabled()) {
      return input;
    }

    const quality = this.config.get<number>('WEBP_QUALITY', 80);

    try {
      return await sharp(input)
        .rotate()
        .webp({ quality })
        .toBuffer();
    } catch (error) {
      this.logger.warn(`WebP conversion failed, using original buffer: ${error}`);
      return input;
    }
  }
}
