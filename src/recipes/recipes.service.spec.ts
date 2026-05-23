import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '../cache/cache.service';
import { AppUrlService } from '../common/services/app-url.service';
import { createRecipe } from '../../test/fixtures/recipe.fixture';
import { RECIPE_REPOSITORY } from './recipe.constants';
import { RecipeMapper } from './mappers/recipe.mapper';
import { RecipesService } from './recipes.service';
import { RecipeValidator } from './validators/recipe.validator';

describe('RecipesService', () => {
  let service: RecipesService;
  let repository: {
    findMany: jest.Mock;
    findDetailById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let mapper: jest.Mocked<Pick<RecipeMapper, 'toPaginated' | 'toDetail'>>;
  let cache: { wrap: jest.Mock; invalidate: jest.Mock };

  beforeEach(async () => {
    repository = {
      findMany: jest.fn(),
      findDetailById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mapper = {
      toPaginated: jest.fn().mockReturnValue({ data: [], meta: {} }),
      toDetail: jest.fn().mockReturnValue({ id: 1, title: 'Mapped' }),
    };

    cache = {
      wrap: jest.fn((_key: string, fn: () => Promise<unknown>) => fn()),
      invalidate: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        { provide: RECIPE_REPOSITORY, useValue: repository },
        { provide: RecipeValidator, useValue: { validateForCreate: jest.fn(), validateForUpdate: jest.fn() } },
        { provide: RecipeMapper, useValue: mapper },
        { provide: AppUrlService, useValue: { normalizeStoredUrl: jest.fn((u) => u) } },
        { provide: CacheService, useValue: cache },
      ],
    }).compile();

    service = module.get(RecipesService);
  });

  describe('findAll', () => {
    it('loads recipes from repository and maps paginated response', async () => {
      const recipes = [createRecipe()];
      repository.findMany.mockResolvedValue({ recipes, total: 1 });

      await service.findAll({ page: 1, limit: 10 });

      expect(cache.wrap).toHaveBeenCalled();
      expect(repository.findMany).toHaveBeenCalled();
      expect(mapper.toPaginated).toHaveBeenCalledWith(recipes, 1, 1, 10);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when recipe missing', async () => {
      repository.findDetailById.mockResolvedValue(null);

      await expect(service.findOne(404)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('invalidates cache after delete', async () => {
      repository.delete.mockResolvedValue(true);

      await service.remove(1);

      expect(cache.invalidate).toHaveBeenCalled();
    });

    it('throws when recipe not found', async () => {
      repository.delete.mockResolvedValue(false);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
