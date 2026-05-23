import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CuisinesService } from './cuisines.service';
import { Cuisine } from './entities/cuisine.entity';

@ApiTags('admin/cuisines')
@Controller('admin/cuisines')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CuisinesAdminController {
  constructor(private readonly cuisinesService: CuisinesService) {}

  @Get()
  @ApiOperation({ summary: 'List all cuisines (admin)' })
  findAll(): Promise<Cuisine[]> {
    return this.cuisinesService.findAll();
  }
}
