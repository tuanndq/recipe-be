import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ingredientsListKey } from './cache/ingredient-cache.keys';
import { CacheService } from '../cache/cache.service';
import { Ingredient } from './entities/ingredient.entity';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>,
    private readonly cache: CacheService,
  ) {}

  findAll(q?: string): Promise<Ingredient[]> {
    return this.cache.wrap(ingredientsListKey(q), () => {
      const qb = this.ingredientRepo
        .createQueryBuilder('ingredient')
        .orderBy('ingredient.name', 'ASC');

      if (q) {
        qb.where('ingredient.name LIKE :q', { q: `%${q}%` });
      }

      return qb.getMany();
    });
  }
}
