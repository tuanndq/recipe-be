import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';
import { extname } from 'path';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

export function createImageUploadMulterOptions(
  config: ConfigService,
): MulterOptions {
  const maxMb = config.get<number>('MAX_FILE_SIZE_MB', 5);

  return {
    storage: memoryStorage(),
    limits: {
      fileSize: maxMb * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return cb(
          new BadRequestException(
            'Only image files (jpg, jpeg, png, webp, gif) are allowed',
          ),
          false,
        );
      }
      cb(null, true);
    },
  };
}
