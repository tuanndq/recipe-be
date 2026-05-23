import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuisinesAdminController } from './cuisines-admin.controller';
import { CuisinesController } from './cuisines.controller';
import { CuisinesService } from './cuisines.service';
import { Cuisine } from './entities/cuisine.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cuisine])],
  controllers: [CuisinesController, CuisinesAdminController],
  providers: [CuisinesService],
})
export class CuisinesModule {}
