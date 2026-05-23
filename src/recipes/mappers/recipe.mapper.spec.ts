import { Test, TestingModule } from '@nestjs/testing';
import { AppUrlService } from '../../common/services/app-url.service';
import { createRecipe } from '../../../test/fixtures/recipe.fixture';
import { RecipeMapper } from './recipe.mapper';

describe('RecipeMapper', () => {
  let mapper: RecipeMapper;

  const appUrl = {
    resolvePublicUrl: jest.fn((url: string | null) =>
      url ? `http://localhost:3000${url}` : null,
    ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipeMapper,
        { provide: AppUrlService, useValue: appUrl },
      ],
    }).compile();

    mapper = module.get(RecipeMapper);
  });

  it('maps list item with resolved image URL', () => {
    const recipe = createRecipe();

    const item = mapper.toListItem(recipe);

    expect(item.id).toBe(1);
    expect(item.title).toBe('Pho Bo');
    expect(item.imageUrl).toBe('http://localhost:3000/uploads/pho.webp');
    expect(item.cuisine.slug).toBe('vietnamese');
  });

  it('sorts ingredients and steps in detail view', () => {
    const recipe = createRecipe();

    const detail = mapper.toDetail(recipe);

    expect(detail.ingredients.map((i) => i.sortOrder)).toEqual([1, 2]);
    expect(detail.steps.map((s) => s.stepNumber)).toEqual([1, 2]);
    expect(detail.updatedAt).toEqual(recipe.updatedAt);
  });

  it('builds paginated result with totalPages', () => {
    const recipes = [createRecipe(), createRecipe({ id: 2, title: 'Banh Mi' })];

    const result = mapper.toPaginated(recipes, 25, 2, 10);

    expect(result.data).toHaveLength(2);
    expect(result.meta).toEqual({
      total: 25,
      page: 2,
      limit: 10,
      totalPages: 3,
    });
  });
});
