import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QueryIngredientsDto } from './dto/query-ingredients.dto';
import { IngredientsService } from './ingredients.service';
import { Ingredient } from './entities/ingredient.entity';

@ApiTags('admin/ingredients')
@Controller('admin/ingredients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IngredientsAdminController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get()
  @ApiOperation({ summary: 'List ingredients (admin)' })
  findAll(@Query() query: QueryIngredientsDto): Promise<Ingredient[]> {
    return this.ingredientsService.findAll(query.q);
  }
}
