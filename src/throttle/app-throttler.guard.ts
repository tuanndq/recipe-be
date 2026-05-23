import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModuleOptions, ThrottlerStorage } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

const SKIP_PATH_PREFIXES = ['/docs', '/uploads'];

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
    private readonly config: ConfigService,
  ) {
    super(options, storageService, reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.config.get<string>('THROTTLE_ENABLED', 'true') === 'false') {
      return true;
    }

    const req = context.switchToHttp().getRequest<{ path?: string; url?: string }>();
    const path = req.path ?? req.url?.split('?')[0] ?? '';

    if (SKIP_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      return true;
    }

    return super.canActivate(context);
  }

  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const ips = req.ips as string[] | undefined;
    if (ips?.length) {
      return ips[0];
    }
    return (req.ip as string) ?? 'unknown';
  }
}
