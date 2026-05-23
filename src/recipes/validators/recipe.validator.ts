import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Cuisine } from '../../cuisines/entities/cuisine.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { CreateRecipeDto } from '../dto/create-recipe.dto';
import { UpdateRecipeDto } from '../dto/update-recipe.dto';

@Injectable()
export class RecipeValidator {
  constructor(
    @InjectRepository(Cuisine)
    private readonly cuisineRepo: Repository<Cuisine>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>,
  ) {}

  async validateForCreate(dto: CreateRecipeDto): Promise<void> {
    await this.validateCuisine(dto.cuisineId);
    await this.validateIngredients(dto.ingredients.map((i) => i.ingredientId));
  }

  async validateForUpdate(dto: UpdateRecipeDto): Promise<void> {
    if (dto.cuisineId !== undefined) {
      await this.validateCuisine(dto.cuisineId);
    }
    if (dto.ingredients?.length) {
      await this.validateIngredients(
        dto.ingredients.map((i) => i.ingredientId),
      );
    }
  }

  async validateCuisine(cuisineId: number): Promise<void> {
    const cuisine = await this.cuisineRepo.findOne({ where: { id: cuisineId } });
    if (!cuisine) {
      throw new NotFoundException(`Cuisine with id ${cuisineId} not found`);
    }
  }

  async validateIngredients(ingredientIds: number[]): Promise<void> {
    const unique = [...new Set(ingredientIds)];
    const found = await this.ingredientRepo.findBy({ id: In(unique) });
    if (found.length !== unique.length) {
      throw new NotFoundException('One or more ingredient IDs are invalid');
    }
  }
}
