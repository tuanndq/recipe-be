import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cuisine } from '../cuisines/entities/cuisine.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { RecipeQueryBuilder } from './builders/recipe-query.builder';
import { InstructionStep } from './entities/instruction-step.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { Recipe } from './entities/recipe.entity';
import { RecipeMapper } from './mappers/recipe.mapper';
import { TypeOrmRecipeRepository } from './repositories/typeorm-recipe.repository';
import { RECIPE_REPOSITORY } from './recipe.constants';
import { RecipesAdminController } from './recipes-admin.controller';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import {
  AllIngredientFilterStrategy,
  AnyIngredientFilterStrategy,
  IngredientFilterStrategyFactory,
} from './strategies/ingredient-filter.strategy';
import { RecipeValidator } from './validators/recipe.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recipe,
      RecipeIngredient,
      InstructionStep,
      Cuisine,
      Ingredient,
    ]),
  ],
  controllers: [RecipesController, RecipesAdminController],
  providers: [
    RecipesService,
    RecipeMapper,
    RecipeValidator,
    RecipeQueryBuilder,
    AnyIngredientFilterStrategy,
    AllIngredientFilterStrategy,
    IngredientFilterStrategyFactory,
    {
      provide: RECIPE_REPOSITORY,
      useClass: TypeOrmRecipeRepository,
    },
  ],
})
export class RecipesModule {}
