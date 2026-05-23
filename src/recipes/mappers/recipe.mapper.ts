import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { AppUrlService } from '../../common/services/app-url.service';
import {
  RecipeDetailDto,
  RecipeListItemDto,
} from '../dto/recipe-response.dto';
import { Recipe } from '../entities/recipe.entity';

@Injectable()
export class RecipeMapper {
  constructor(private readonly appUrl: AppUrlService) {}

  toListItem(recipe: Recipe): RecipeListItemDto {
    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      imageUrl: this.appUrl.resolvePublicUrl(recipe.imageUrl),
      cuisine: {
        id: recipe.cuisine.id,
        name: recipe.cuisine.name,
        slug: recipe.cuisine.slug,
      },
      prepTimeMinutes: recipe.prepTimeMinutes,
      cookTimeMinutes: recipe.cookTimeMinutes,
      servings: recipe.servings,
      createdAt: recipe.createdAt,
    };
  }

  toDetail(recipe: Recipe): RecipeDetailDto {
    return {
      ...this.toListItem(recipe),
      ingredients: (recipe.recipeIngredients ?? [])
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((ri) => ({
          id: ri.id,
          ingredientId: ri.ingredient.id,
          name: ri.ingredient.name,
          quantity: ri.quantity,
          sortOrder: ri.sortOrder,
        })),
      steps: (recipe.steps ?? [])
        .sort((a, b) => a.stepNumber - b.stepNumber)
        .map((s) => ({
          id: s.id,
          stepNumber: s.stepNumber,
          instruction: s.instruction,
        })),
      updatedAt: recipe.updatedAt,
    };
  }

  toPaginated(
    recipes: Recipe[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResult<RecipeListItemDto> {
    return {
      data: recipes.map((r) => this.toListItem(r)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
