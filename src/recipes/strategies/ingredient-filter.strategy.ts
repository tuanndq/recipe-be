import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { IngredientMatchMode } from '../dto/query-recipes.dto';
import { Recipe } from '../entities/recipe.entity';

export interface IngredientFilterStrategy {
  apply(qb: SelectQueryBuilder<Recipe>, ingredientIds: number[]): void;
}

@Injectable()
export class AnyIngredientFilterStrategy implements IngredientFilterStrategy {
  apply(qb: SelectQueryBuilder<Recipe>, ingredientIds: number[]): void {
    qb.andWhere(
      `EXISTS (
        SELECT 1 FROM recipe_ingredients ri
        WHERE ri.recipe_id = recipe.id
        AND ri.ingredient_id IN (:...ingredientIds)
      )`,
      { ingredientIds },
    );
  }
}

@Injectable()
export class AllIngredientFilterStrategy implements IngredientFilterStrategy {
  apply(qb: SelectQueryBuilder<Recipe>, ingredientIds: number[]): void {
    ingredientIds.forEach((ingredientId, index) => {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM recipe_ingredients ri${index}
          WHERE ri${index}.recipe_id = recipe.id
          AND ri${index}.ingredient_id = :ingredientId${index}
        )`,
        { [`ingredientId${index}`]: ingredientId },
      );
    });
  }
}

@Injectable()
export class IngredientFilterStrategyFactory {
  constructor(
    private readonly anyStrategy: AnyIngredientFilterStrategy,
    private readonly allStrategy: AllIngredientFilterStrategy,
  ) {}

  get(mode: IngredientMatchMode): IngredientFilterStrategy {
    return mode === IngredientMatchMode.ALL
      ? this.allStrategy
      : this.anyStrategy;
  }
}
