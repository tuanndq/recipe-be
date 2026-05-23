import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  IngredientMatchMode,
  QueryRecipesDto,
  RecipeSortField,
} from '../dto/query-recipes.dto';
import { Recipe } from '../entities/recipe.entity';
import { IngredientFilterStrategyFactory } from '../strategies/ingredient-filter.strategy';

@Injectable()
export class RecipeQueryBuilder {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepo: Repository<Recipe>,
    private readonly ingredientFilterFactory: IngredientFilterStrategyFactory,
  ) {}

  build(query: QueryRecipesDto): SelectQueryBuilder<Recipe> {
    const qb = this.recipeRepo
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.cuisine', 'cuisine');

    if (query.q) {
      qb.andWhere(
        '(recipe.title LIKE :q OR recipe.description LIKE :q)',
        { q: `%${query.q}%` },
      );
    }

    if (query.cuisine?.length) {
      qb.andWhere('recipe.cuisineId IN (:...cuisineIds)', {
        cuisineIds: query.cuisine,
      });
    }

    if (query.ingredient?.length) {
      const mode = query.ingredientMatch ?? IngredientMatchMode.ANY;
      this.ingredientFilterFactory
        .get(mode)
        .apply(qb, query.ingredient);
    }

    this.applySort(qb, query.sort ?? RecipeSortField.NEWEST);
    return qb;
  }

  private applySort(
    qb: SelectQueryBuilder<Recipe>,
    sort: RecipeSortField,
  ): void {
    switch (sort) {
      case RecipeSortField.OLDEST:
        qb.orderBy('recipe.createdAt', 'ASC');
        break;
      case RecipeSortField.TITLE_ASC:
        qb.orderBy('recipe.title', 'ASC');
        break;
      case RecipeSortField.TITLE_DESC:
        qb.orderBy('recipe.title', 'DESC');
        break;
      case RecipeSortField.NEWEST:
      default:
        qb.orderBy('recipe.createdAt', 'DESC');
    }
  }
}
