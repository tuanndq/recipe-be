import { Global, Module } from '@nestjs/common';
import { AppUrlService } from './services/app-url.service';

@Global()
@Module({
  providers: [AppUrlService],
  exports: [AppUrlService],
})
export class CommonModule {}
