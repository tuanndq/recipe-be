import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginatedResult } from '../common/dto/pagination.dto';
import { QueryRecipesDto } from './dto/query-recipes.dto';
import {
  RecipeDetailDto,
  RecipeListItemDto,
} from './dto/recipe-response.dto';
import { RecipesService } from './recipes.service';

@ApiTags('recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  @ApiOperation({ summary: 'List recipes with search, filters, pagination' })
  @ApiResponse({ status: 200, description: 'Paginated recipe list' })
  findAll(
    @Query() query: QueryRecipesDto,
  ): Promise<PaginatedResult<RecipeListItemDto>> {
    return this.recipesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get recipe detail with ingredients and steps' })
  @ApiResponse({ status: 200, type: RecipeDetailDto })
  @ApiResponse({ status: 404, description: 'Recipe not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<RecipeDetailDto> {
    return this.recipesService.findOne(id);
  }
}
