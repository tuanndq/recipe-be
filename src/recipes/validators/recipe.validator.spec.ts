import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cuisine } from '../../cuisines/entities/cuisine.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { RecipeValidator } from './recipe.validator';

describe('RecipeValidator', () => {
  let validator: RecipeValidator;
  let cuisineRepo: jest.Mocked<Pick<Repository<Cuisine>, 'findOne'>>;
  let ingredientRepo: jest.Mocked<Pick<Repository<Ingredient>, 'findBy'>>;

  beforeEach(async () => {
    cuisineRepo = { findOne: jest.fn() };
    ingredientRepo = { findBy: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipeValidator,
        { provide: getRepositoryToken(Cuisine), useValue: cuisineRepo },
        { provide: getRepositoryToken(Ingredient), useValue: ingredientRepo },
      ],
    }).compile();

    validator = module.get(RecipeValidator);
  });

  describe('validateForCreate', () => {
    it('passes when cuisine and ingredients exist', async () => {
      cuisineRepo.findOne.mockResolvedValue({ id: 1 } as Cuisine);
      ingredientRepo.findBy.mockResolvedValue([
        { id: 1 } as Ingredient,
        { id: 2 } as Ingredient,
      ]);

      await expect(
        validator.validateForCreate({
          title: 'Test',
          cuisineId: 1,
          ingredients: [
            { ingredientId: 1, quantity: '1', sortOrder: 0 },
            { ingredientId: 2, quantity: '2', sortOrder: 1 },
          ],
          steps: [{ stepNumber: 1, instruction: 'Cook' }],
        }),
      ).resolves.toBeUndefined();
    });

    it('throws when cuisine is missing', async () => {
      cuisineRepo.findOne.mockResolvedValue(null);

      await expect(
        validator.validateForCreate({
          title: 'Test',
          cuisineId: 99,
          ingredients: [],
          steps: [{ stepNumber: 1, instruction: 'Cook' }],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws when an ingredient id is invalid', async () => {
      cuisineRepo.findOne.mockResolvedValue({ id: 1 } as Cuisine);
      ingredientRepo.findBy.mockResolvedValue([{ id: 1 } as Ingredient]);

      await expect(
        validator.validateForCreate({
          title: 'Test',
          cuisineId: 1,
          ingredients: [
            { ingredientId: 1, quantity: '1', sortOrder: 0 },
            { ingredientId: 2, quantity: '2', sortOrder: 1 },
          ],
          steps: [{ stepNumber: 1, instruction: 'Cook' }],
        }),
      ).rejects.toThrow(/ingredient IDs are invalid/);
    });
  });
});
