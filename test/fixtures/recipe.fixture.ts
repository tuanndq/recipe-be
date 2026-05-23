import { Cuisine } from '../../src/cuisines/entities/cuisine.entity';
import { Ingredient } from '../../src/ingredients/entities/ingredient.entity';
import { InstructionStep } from '../../src/recipes/entities/instruction-step.entity';
import { RecipeIngredient } from '../../src/recipes/entities/recipe-ingredient.entity';
import { Recipe } from '../../src/recipes/entities/recipe.entity';

export function createCuisine(overrides: Partial<Cuisine> = {}): Cuisine {
  return {
    id: 1,
    name: 'Vietnamese',
    slug: 'vietnamese',
    recipes: [],
    ...overrides,
  };
}

export function createRecipe(overrides: Partial<Recipe> = {}): Recipe {
  const cuisine = overrides.cuisine ?? createCuisine();
  const createdAt = new Date('2024-01-15T10:00:00.000Z');
  const updatedAt = new Date('2024-01-16T10:00:00.000Z');

  const recipe: Recipe = {
    id: 1,
    title: 'Pho Bo',
    description: 'Classic beef noodle soup',
    imageUrl: '/uploads/pho.webp',
    prepTimeMinutes: 30,
    cookTimeMinutes: 180,
    servings: 4,
    cuisine,
    cuisineId: cuisine.id,
    recipeIngredients: [
      {
        id: 10,
        recipeId: 1,
        ingredientId: 100,
        quantity: '500g',
        sortOrder: 2,
        ingredient: { id: 100, name: 'Beef', slug: 'beef' } as Ingredient,
      } as RecipeIngredient,
      {
        id: 11,
        recipeId: 1,
        ingredientId: 101,
        quantity: '200g',
        sortOrder: 1,
        ingredient: { id: 101, name: 'Rice noodles', slug: 'rice-noodles' } as Ingredient,
      } as RecipeIngredient,
    ],
    steps: [
      {
        id: 20,
        recipeId: 1,
        stepNumber: 2,
        instruction: 'Simmer broth',
      } as InstructionStep,
      {
        id: 21,
        recipeId: 1,
        stepNumber: 1,
        instruction: 'Prepare bones',
      } as InstructionStep,
    ],
    createdAt,
    updatedAt,
    ...overrides,
  };

  return recipe;
}
