import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { createClient } from 'redis';
import { REDIS_CLIENT } from './cache.constants';
import { CacheService } from './cache.service';
import { CACHE_INVALIDATOR } from './interfaces/cache-invalidator.interface';
import { RedisCacheInvalidator } from './redis-cache.invalidator';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (config: ConfigService) => {
        const ttlSeconds = config.get<number>('CACHE_TTL_SECONDS', 300);
        const password = config.get<string>('REDIS_PASSWORD');

        return {
          store: await redisStore({
            socket: {
              host: config.get<string>('REDIS_HOST', 'localhost'),
              port: config.get<number>('REDIS_PORT', 6379),
            },
            ...(password ? { password } : {}),
          }),
          ttl: ttlSeconds * 1000,
        };
      },
    }),
  ],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const password = config.get<string>('REDIS_PASSWORD');
        const client = createClient({
          socket: {
            host: config.get<string>('REDIS_HOST', 'localhost'),
            port: config.get<number>('REDIS_PORT', 6379),
          },
          ...(password ? { password } : {}),
        });
        await client.connect();
        return client;
      },
    },
    {
      provide: CACHE_INVALIDATOR,
      useClass: RedisCacheInvalidator,
    },
    CacheService,
  ],
  exports: [CacheModule, CacheService, REDIS_CLIENT, CACHE_INVALIDATOR],
})
export class AppCacheModule {}
