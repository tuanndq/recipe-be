import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, readdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AppUrlService } from '../../common/services/app-url.service';
import {
  FileStorage,
  SaveImageResult,
  StoredFileInfo,
} from '../interfaces/file-storage.interface';

@Injectable()
export class LocalFileStorage implements FileStorage {
  constructor(
    private readonly config: ConfigService,
    private readonly appUrl: AppUrlService,
  ) {}

  getUploadDirectory(): string {
    return this.config.get<string>('UPLOAD_DIR', 'uploads');
  }

  buildStoredFilename(): string {
    return `${uuidv4()}.webp`;
  }

  toPublicUrl(filename: string): string {
    return this.appUrl.resolvePublicUrl(`/uploads/${filename}`)!;
  }

  async saveImage(buffer: Buffer, _originalName: string): Promise<SaveImageResult> {
    const filename = this.buildStoredFilename();
    const uploadDir = this.getUploadDirectory();
    const absoluteDir = join(process.cwd(), uploadDir);
    await mkdir(absoluteDir, { recursive: true });
    await writeFile(join(absoluteDir, filename), buffer);

    return {
      filename,
      url: this.toPublicUrl(filename),
      size: buffer.length,
    };
  }

  async list(): Promise<StoredFileInfo[]> {
    const uploadDir = this.getUploadDirectory();
    const absoluteDir = join(process.cwd(), uploadDir);
    let entries: string[];
    try {
      entries = await readdir(absoluteDir);
    } catch {
      return [];
    }

    return entries
      .filter((name) => !name.startsWith('.') && name.endsWith('.webp'))
      .map((filename) => ({
        filename,
        url: this.toPublicUrl(filename),
      }));
  }
}
