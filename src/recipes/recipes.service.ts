import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { PaginatedResult } from '../common/dto/pagination.dto';
import { AppUrlService } from '../common/services/app-url.service';
import {
  recipeDetailKey,
  recipesListKey,
} from './cache/recipe-cache.keys';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { QueryRecipesDto } from './dto/query-recipes.dto';
import {
  RecipeDetailDto,
  RecipeListItemDto,
} from './dto/recipe-response.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { IRecipeRepository } from './interfaces/recipe-repository.interface';
import { RecipeMapper } from './mappers/recipe.mapper';
import { RECIPE_REPOSITORY, RECIPES_CACHE_PATTERN } from './recipe.constants';
import { RecipeValidator } from './validators/recipe.validator';

@Injectable()
export class RecipesService {
  constructor(
    @Inject(RECIPE_REPOSITORY)
    private readonly repository: IRecipeRepository,
    private readonly validator: RecipeValidator,
    private readonly mapper: RecipeMapper,
    private readonly appUrl: AppUrlService,
    private readonly cache: CacheService,
  ) {}

  findAll(query: QueryRecipesDto): Promise<PaginatedResult<RecipeListItemDto>> {
    return this.cache.wrap(recipesListKey(query), async () => {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const { recipes, total } = await this.repository.findMany(query);
      return this.mapper.toPaginated(recipes, total, page, limit);
    });
  }

  findOne(id: number): Promise<RecipeDetailDto> {
    return this.cache.wrap(recipeDetailKey(id), () => this.findOneFromDb(id));
  }

  async create(dto: CreateRecipeDto): Promise<RecipeDetailDto> {
    await this.validator.validateForCreate(dto);
    const recipe = await this.repository.create({
      dto,
      imageUrl: this.appUrl.normalizeStoredUrl(dto.imageUrl),
    });
    await this.cache.invalidate(RECIPES_CACHE_PATTERN);
    return this.mapper.toDetail(recipe);
  }

  async update(id: number, dto: UpdateRecipeDto): Promise<RecipeDetailDto> {
    await this.validator.validateForUpdate(dto);
    const recipe = await this.repository.update({
      id,
      dto,
      imageUrl:
        dto.imageUrl !== undefined
          ? this.appUrl.normalizeStoredUrl(dto.imageUrl)
          : undefined,
    });
    await this.cache.invalidate(RECIPES_CACHE_PATTERN);
    return this.mapper.toDetail(recipe);
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }
    await this.cache.invalidate(RECIPES_CACHE_PATTERN);
  }

  private async findOneFromDb(id: number): Promise<RecipeDetailDto> {
    const recipe = await this.repository.findDetailById(id);
    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }
    return this.mapper.toDetail(recipe);
  }
}
