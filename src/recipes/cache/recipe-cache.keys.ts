import { createHash } from 'crypto';
import { QueryRecipesDto } from '../dto/query-recipes.dto';

function hashPayload(payload: unknown): string {
  return createHash('sha256')
    .update(JSON.stringify(payload))
    .digest('hex')
    .slice(0, 16);
}

export function recipesListKey(query: QueryRecipesDto): string {
  const payload = {
    q: query.q ?? '',
    cuisine: [...(query.cuisine ?? [])].sort((a, b) => a - b),
    ingredient: [...(query.ingredient ?? [])].sort((a, b) => a - b),
    ingredientMatch: query.ingredientMatch ?? 'any',
    sort: query.sort ?? 'newest',
    page: query.page ?? 1,
    limit: query.limit ?? 10,
  };
  return `recipes:list:${hashPayload(payload)}`;
}

export function recipeDetailKey(id: number): string {
  return `recipes:detail:${id}`;
}
