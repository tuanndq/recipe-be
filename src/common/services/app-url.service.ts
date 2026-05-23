import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppUrlService {
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    const configured = this.config.get<string>('APP_URL', 'http://localhost:3000');
    this.baseUrl = configured.replace(/\/$/, '');
  }

  /** Convert stored path (/uploads/...) to full public URL for API responses. */
  resolvePublicUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${this.baseUrl}${path}`;
  }

  /** Store relative path in DB (strip APP_URL prefix if present). */
  normalizeStoredUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith(this.baseUrl)) {
      const path = url.slice(this.baseUrl.length);
      return path.startsWith('/') ? path : `/${path}`;
    }
    if (/^https?:\/\//i.test(url)) return url;
    return url.startsWith('/') ? url : `/${url}`;
  }
}
