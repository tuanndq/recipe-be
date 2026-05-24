import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  THROTTLE_DEFAULT,
  UPLOAD_THROTTLE,
} from '../throttle/throttle.constants';
import { ImageUploadInterceptor } from './interceptors/image-upload.interceptor';
import { UploadsService } from './uploads.service';

@ApiTags('admin/uploads')
@Controller('admin/uploads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadsAdminController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Get('images')
  @ApiOperation({ summary: 'List uploaded images (admin)' })
  listImages() {
    return this.uploadsService.listFiles();
  }

  @Post('images')
  @Throttle({ [THROTTLE_DEFAULT]: UPLOAD_THROTTLE })
  @UseInterceptors(ImageUploadInterceptor)
  @ApiOperation({ summary: 'Upload recipe image (converted to WebP)' })
  @ApiResponse({ status: 429, description: 'Too many upload requests' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.uploadImage(file);
  }
}
