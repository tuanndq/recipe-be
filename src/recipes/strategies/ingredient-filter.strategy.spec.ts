import {
  AllIngredientFilterStrategy,
  AnyIngredientFilterStrategy,
  IngredientFilterStrategyFactory,
} from './ingredient-filter.strategy';
import { IngredientMatchMode } from '../dto/query-recipes.dto';

describe('IngredientFilterStrategyFactory', () => {
  const anyStrategy = new AnyIngredientFilterStrategy();
  const allStrategy = new AllIngredientFilterStrategy();
  const factory = new IngredientFilterStrategyFactory(anyStrategy, allStrategy);

  it('returns any strategy by default', () => {
    expect(factory.get(IngredientMatchMode.ANY)).toBe(anyStrategy);
  });

  it('returns all strategy for ALL mode', () => {
    expect(factory.get(IngredientMatchMode.ALL)).toBe(allStrategy);
  });
});

describe('AnyIngredientFilterStrategy', () => {
  it('adds EXISTS filter for ingredient ids', () => {
    const andWhere = jest.fn().mockReturnThis();
    const qb = { andWhere } as unknown as Parameters<
      AnyIngredientFilterStrategy['apply']
    >[0];

    new AnyIngredientFilterStrategy().apply(qb, [1, 2]);

    expect(andWhere).toHaveBeenCalledWith(
      expect.stringContaining('recipe_ingredients'),
      { ingredientIds: [1, 2] },
    );
  });
});

describe('AllIngredientFilterStrategy', () => {
  it('adds one EXISTS clause per ingredient', () => {
    const andWhere = jest.fn().mockReturnThis();
    const qb = { andWhere } as unknown as Parameters<
      AllIngredientFilterStrategy['apply']
    >[0];

    new AllIngredientFilterStrategy().apply(qb, [1, 2, 3]);

    expect(andWhere).toHaveBeenCalledTimes(3);
  });
});
