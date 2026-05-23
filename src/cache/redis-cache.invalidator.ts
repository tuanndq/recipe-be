import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RedisClientType } from 'redis';
import { REDIS_CLIENT } from './cache.constants';
import { CacheInvalidator } from './interfaces/cache-invalidator.interface';

@Injectable()
export class RedisCacheInvalidator implements CacheInvalidator {
  private readonly logger = new Logger(RedisCacheInvalidator.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: RedisClientType,
    private readonly config: ConfigService,
  ) {}

  private prefix(pattern: string): string {
    const prefix = this.config.get<string>('CACHE_KEY_PREFIX', 'recipe-api');
    return `${prefix}:${pattern}`;
  }

  async deleteByPattern(pattern: string): Promise<void> {
    try {
      const fullPattern = this.prefix(pattern);
      const keys = await this.redis.keys(fullPattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
        this.logger.debug(
          `Invalidated ${keys.length} cache key(s): ${fullPattern}`,
        );
      }
    } catch (error) {
      this.logger.warn(`Cache invalidation failed for ${pattern}: ${error}`);
    }
  }
}
