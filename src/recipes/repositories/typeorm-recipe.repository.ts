import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RecipeQueryBuilder } from '../builders/recipe-query.builder';
import { QueryRecipesDto } from '../dto/query-recipes.dto';
import { InstructionStep } from '../entities/instruction-step.entity';
import { RecipeIngredient } from '../entities/recipe-ingredient.entity';
import { Recipe } from '../entities/recipe.entity';
import {
  IRecipeRepository,
  RecipeCreateData,
  RecipeFindManyResult,
  RecipeUpdateData,
} from '../interfaces/recipe-repository.interface';

const RECIPE_DETAIL_RELATIONS = {
  cuisine: true,
  recipeIngredients: { ingredient: true },
  steps: true,
} as const;

const RECIPE_DETAIL_ORDER = {
  recipeIngredients: { sortOrder: 'ASC' as const },
  steps: { stepNumber: 'ASC' as const },
};

@Injectable()
export class TypeOrmRecipeRepository implements IRecipeRepository {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepo: Repository<Recipe>,
    private readonly dataSource: DataSource,
    private readonly queryBuilder: RecipeQueryBuilder,
  ) {}

  async findMany(query: QueryRecipesDto): Promise<RecipeFindManyResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const qb = this.queryBuilder.build(query);
    const [recipes, total] = await qb.skip(skip).take(limit).getManyAndCount();
    return { recipes, total };
  }

  async findDetailById(id: number): Promise<Recipe | null> {
    return this.recipeRepo.findOne({
      where: { id },
      relations: RECIPE_DETAIL_RELATIONS,
      order: RECIPE_DETAIL_ORDER,
    });
  }

  async create(data: RecipeCreateData): Promise<Recipe> {
    const { dto, imageUrl } = data;

    return this.dataSource.transaction(async (manager) => {
      const recipeRepo = manager.getRepository(Recipe);
      const riRepo = manager.getRepository(RecipeIngredient);
      const stepRepo = manager.getRepository(InstructionStep);

      const saved = await recipeRepo.save(
        recipeRepo.create({
          title: dto.title,
          description: dto.description ?? null,
          imageUrl,
          cuisineId: dto.cuisineId,
          prepTimeMinutes: dto.prepTimeMinutes ?? null,
          cookTimeMinutes: dto.cookTimeMinutes ?? null,
          servings: dto.servings ?? 1,
        }),
      );

      await riRepo.save(
        dto.ingredients.map((ing, index) =>
          riRepo.create({
            recipeId: saved.id,
            ingredientId: ing.ingredientId,
            quantity: ing.quantity ?? null,
            sortOrder: ing.sortOrder ?? index,
          }),
        ),
      );

      await stepRepo.save(
        dto.steps.map((step) =>
          stepRepo.create({
            recipeId: saved.id,
            stepNumber: step.stepNumber,
            instruction: step.instruction,
          }),
        ),
      );

      return recipeRepo.findOneOrFail({
        where: { id: saved.id },
        relations: RECIPE_DETAIL_RELATIONS,
        order: RECIPE_DETAIL_ORDER,
      });
    });
  }

  async update(data: RecipeUpdateData): Promise<Recipe> {
    const { id, dto, imageUrl } = data;

    const existing = await this.recipeRepo.findOne({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }

    return this.dataSource.transaction(async (manager) => {
      const recipeRepo = manager.getRepository(Recipe);
      const riRepo = manager.getRepository(RecipeIngredient);
      const stepRepo = manager.getRepository(InstructionStep);

      if (dto.title !== undefined) existing.title = dto.title;
      if (dto.description !== undefined) {
        existing.description = dto.description ?? null;
      }
      if (imageUrl !== undefined) existing.imageUrl = imageUrl;
      if (dto.cuisineId !== undefined) existing.cuisineId = dto.cuisineId;
      if (dto.prepTimeMinutes !== undefined) {
        existing.prepTimeMinutes = dto.prepTimeMinutes ?? null;
      }
      if (dto.cookTimeMinutes !== undefined) {
        existing.cookTimeMinutes = dto.cookTimeMinutes ?? null;
      }
      if (dto.servings !== undefined) existing.servings = dto.servings;

      await recipeRepo.save(existing);

      if (dto.ingredients) {
        await riRepo.delete({ recipeId: id });
        await riRepo.save(
          dto.ingredients.map((ing, index) =>
            riRepo.create({
              recipeId: id,
              ingredientId: ing.ingredientId,
              quantity: ing.quantity ?? null,
              sortOrder: ing.sortOrder ?? index,
            }),
          ),
        );
      }

      if (dto.steps) {
        await stepRepo.delete({ recipeId: id });
        await stepRepo.save(
          dto.steps.map((step) =>
            stepRepo.create({
              recipeId: id,
              stepNumber: step.stepNumber,
              instruction: step.instruction,
            }),
          ),
        );
      }

      return recipeRepo.findOneOrFail({
        where: { id },
        relations: RECIPE_DETAIL_RELATIONS,
        order: RECIPE_DETAIL_ORDER,
      });
    });
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.recipeRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
