import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { RedisClientType } from 'redis';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { AppCacheModule } from './cache/cache.module';
import { REDIS_CLIENT } from './cache/cache.constants';
import { CommonModule } from './common/common.module';
import { configValidationSchema } from './config/config.validation';
import { CuisinesModule } from './cuisines/cuisines.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { RecipesModule } from './recipes/recipes.module';
import { UploadsModule } from './uploads/uploads.module';
import { AppThrottlerGuard } from './throttle/app-throttler.guard';
import { RedisThrottlerStorage } from './throttle/redis-throttler.storage';
import { THROTTLE_DEFAULT } from './throttle/throttle.constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, AppCacheModule],
      inject: [ConfigService, REDIS_CLIENT],
      useFactory: (config: ConfigService, redis: RedisClientType) => {
        const enabled = config.get<string>('THROTTLE_ENABLED', 'true') !== 'false';
        return {
          throttlers: [
            {
              name: THROTTLE_DEFAULT,
              ttl: config.get<number>('THROTTLE_TTL_MS', 60_000),
              limit: config.get<number>('THROTTLE_LIMIT', 100),
            },
          ],
          storage: enabled ? new RedisThrottlerStorage(redis) : undefined,
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize:
          config.get<string>('NODE_ENV') !== 'production' ||
          config.get<string>('DB_SYNC') === 'true',
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          rootPath: join(process.cwd(), config.get<string>('UPLOAD_DIR', 'uploads')),
          serveRoot: '/uploads',
        },
      ],
    }),
    AppCacheModule,
    CommonModule,
    AuthModule,
    RecipesModule,
    CuisinesModule,
    IngredientsModule,
    UploadsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AppThrottlerGuard,
    },
  ],
})
export class AppModule {}
