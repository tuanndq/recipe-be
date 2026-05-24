import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import {
  FileStorage,
  SaveImageResult,
  StoredFileInfo,
} from '../interfaces/file-storage.interface';

@Injectable()
export class S3FileStorage implements FileStorage {
  private readonly logger = new Logger(S3FileStorage.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly prefix: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly config: ConfigService) {
    const region = this.config.get<string>('AWS_REGION', 'ap-southeast-1');
    this.bucket = this.config.get<string>('S3_BUCKET', '');
    this.prefix = this.config.get<string>('S3_PREFIX', 'recipes').replace(/\/$/, '');

    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');

    this.client = new S3Client({
      region,
      ...(accessKeyId && secretAccessKey
        ? { credentials: { accessKeyId, secretAccessKey } }
        : {}),
    });

    const configuredBase = this.config.get<string>('S3_PUBLIC_BASE_URL');
    this.publicBaseUrl =
      configuredBase?.replace(/\/$/, '') ||
      `https://${this.bucket}.s3.${region}.amazonaws.com`;
  }

  buildStoredFilename(): string {
    return `${uuidv4()}.webp`;
  }

  private objectKey(filename: string): string {
    return this.prefix ? `${this.prefix}/${filename}` : filename;
  }

  toPublicUrl(filename: string): string {
    return `${this.publicBaseUrl}/${this.objectKey(filename)}`;
  }

  async saveImage(buffer: Buffer, _originalName: string): Promise<SaveImageResult> {
    const filename = this.buildStoredFilename();
    const key = this.objectKey(filename);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000',
      }),
    );

    this.logger.debug(`Uploaded to s3://${this.bucket}/${key}`);

    return {
      filename,
      url: this.toPublicUrl(filename),
      size: buffer.length,
    };
  }

  async list(): Promise<StoredFileInfo[]> {
    const response = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: this.prefix ? `${this.prefix}/` : undefined,
      }),
    );

    return (response.Contents ?? [])
      .map((item) => item.Key)
      .filter((key): key is string => !!key && key.endsWith('.webp'))
      .map((key) => {
        const filename = key.split('/').pop()!;
        return {
          filename,
          url: `${this.publicBaseUrl}/${key}`,
        };
      });
  }

  async delete(filename: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: this.objectKey(filename),
      }),
    );
  }
}
