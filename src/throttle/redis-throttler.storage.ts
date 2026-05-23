import { ThrottlerStorage } from '@nestjs/throttler';
import type { RedisClientType } from 'redis';

export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(private readonly redis: RedisClientType) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ) {
    const redisKey = `throttle:${throttlerName}:${key}`;
    const totalHits = await this.redis.incr(redisKey);

    if (totalHits === 1) {
      await this.redis.pExpire(redisKey, ttl);
    }

    const timeToExpire = await this.redis.pTTL(redisKey);
    const isBlocked = totalHits > limit;

    return {
      totalHits,
      timeToExpire: timeToExpire > 0 ? timeToExpire : ttl,
      isBlocked,
      timeToBlockExpire: isBlocked ? blockDuration : 0,
    };
  }
}
