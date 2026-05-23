import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import {
  CACHE_INVALIDATOR,
  CacheInvalidator,
} from './interfaces/cache-invalidator.interface';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(CACHE_INVALIDATOR)
    private readonly cacheInvalidator: CacheInvalidator,
    private readonly config: ConfigService,
  ) {}

  isEnabled(): boolean {
    return this.config.get<string>('CACHE_ENABLED', 'true') !== 'false';
  }

  private prefix(key: string): string {
    const prefix = this.config.get<string>('CACHE_KEY_PREFIX', 'recipe-api');
    return `${prefix}:${key}`;
  }

  private async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled()) return null;
    try {
      const value = await this.cacheManager.get<T>(this.prefix(key));
      return value ?? null;
    } catch (error) {
      this.logger.warn(`Cache get failed for ${key}: ${error}`);
      return null;
    }
  }

  private async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      const ttlMs =
        (ttlSeconds ?? this.config.get<number>('CACHE_TTL_SECONDS', 300)) *
        1000;
      await this.cacheManager.set(this.prefix(key), value, ttlMs);
    } catch (error) {
      this.logger.warn(`Cache set failed for ${key}: ${error}`);
    }
  }

  async wrap<T>(
    key: string,
    loader: () => Promise<T>,
    ttlSeconds?: number,
  ): Promise<T> {
    if (!this.isEnabled()) {
      return loader();
    }

    const cached = await this.get<T>(key);
    if (cached !== undefined && cached !== null) {
      return cached;
    }

    const value = await loader();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  async invalidate(pattern: string): Promise<void> {
    if (!this.isEnabled()) return;
    await this.cacheInvalidator.deleteByPattern(pattern);
  }
}
