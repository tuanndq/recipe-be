import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedResult } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { QueryRecipesDto } from './dto/query-recipes.dto';
import {
  RecipeDetailDto,
  RecipeListItemDto,
} from './dto/recipe-response.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipesService } from './recipes.service';

@ApiTags('admin/recipes')
@Controller('admin/recipes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecipesAdminController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  @ApiOperation({ summary: 'List recipes (admin)' })
  @ApiResponse({ status: 200, description: 'Paginated recipe list' })
  findAll(
    @Query() query: QueryRecipesDto,
  ): Promise<PaginatedResult<RecipeListItemDto>> {
    return this.recipesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get recipe detail (admin)' })
  @ApiResponse({ status: 200, type: RecipeDetailDto })
  @ApiResponse({ status: 404, description: 'Recipe not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<RecipeDetailDto> {
    return this.recipesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create recipe' })
  @ApiResponse({ status: 201, type: RecipeDetailDto })
  create(@Body() dto: CreateRecipeDto): Promise<RecipeDetailDto> {
    return this.recipesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update recipe' })
  @ApiResponse({ status: 200, type: RecipeDetailDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRecipeDto,
  ): Promise<RecipeDetailDto> {
    return this.recipesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete recipe' })
  @ApiResponse({ status: 200, description: 'Recipe deleted' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.recipesService.remove(id);
    return { message: 'Recipe deleted successfully' };
  }
}
