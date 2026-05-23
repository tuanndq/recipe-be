import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueryIngredientsDto } from './dto/query-ingredients.dto';
import { IngredientsService } from './ingredients.service';
import { Ingredient } from './entities/ingredient.entity';

@ApiTags('ingredients')
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get()
  @ApiOperation({ summary: 'List ingredients (optional name filter)' })
  findAll(@Query() query: QueryIngredientsDto): Promise<Ingredient[]> {
    return this.ingredientsService.findAll(query.q);
  }
}
