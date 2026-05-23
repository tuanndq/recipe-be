import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CuisinesService } from './cuisines.service';
import { Cuisine } from './entities/cuisine.entity';

@ApiTags('cuisines')
@Controller('cuisines')
export class CuisinesController {
  constructor(private readonly cuisinesService: CuisinesService) {}

  @Get()
  @ApiOperation({ summary: 'List all cuisines' })
  findAll(): Promise<Cuisine[]> {
    return this.cuisinesService.findAll();
  }
}
