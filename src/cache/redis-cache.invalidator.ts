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
      const patterns = [fullPattern, `keyv:${fullPattern}`];

      let total = 0;
      for (const p of patterns) {
        const keys = await this.redis.keys(p);
        if (keys.length > 0) {
          await this.redis.del(keys);
          total += keys.length;
        }
      }

      if (total > 0) {
        this.logger.debug(
          `Invalidated ${total} cache key(s) for pattern: ${fullPattern}`,
        );
      }
    } catch (error) {
      this.logger.warn(`Cache invalidation failed for ${pattern}: ${error}`);
    }
  }
}
