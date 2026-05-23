import { CreateRecipeDto } from '../dto/create-recipe.dto';
import { QueryRecipesDto } from '../dto/query-recipes.dto';
import { UpdateRecipeDto } from '../dto/update-recipe.dto';
import { Recipe } from '../entities/recipe.entity';

export interface RecipeFindManyResult {
  recipes: Recipe[];
  total: number;
}

export interface RecipeCreateData {
  dto: CreateRecipeDto;
  imageUrl: string | null;
}

export interface RecipeUpdateData {
  id: number;
  dto: UpdateRecipeDto;
  imageUrl?: string | null;
}

export interface IRecipeRepository {
  findMany(query: QueryRecipesDto): Promise<RecipeFindManyResult>;
  findDetailById(id: number): Promise<Recipe | null>;
  create(data: RecipeCreateData): Promise<Recipe>;
  update(data: RecipeUpdateData): Promise<Recipe>;
  delete(id: number): Promise<boolean>;
}
