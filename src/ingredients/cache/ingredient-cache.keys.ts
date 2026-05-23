export const INGREDIENTS_CACHE_PATTERN = 'ingredients:*';

export function ingredientsListKey(q?: string): string {
  return `ingredients:list:${q?.trim().toLowerCase() || 'all'}`;
}
