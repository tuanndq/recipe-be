import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { cuisinesListKey } from './cache/cuisine-cache.keys';
import { CacheService } from '../cache/cache.service';
import { Cuisine } from './entities/cuisine.entity';

@Injectable()
export class CuisinesService {
  constructor(
    @InjectRepository(Cuisine)
    private readonly cuisineRepo: Repository<Cuisine>,
    private readonly cache: CacheService,
  ) {}

  findAll(): Promise<Cuisine[]> {
    return this.cache.wrap(cuisinesListKey(), () =>
      this.cuisineRepo.find({ order: { name: 'ASC' } }),
    );
  }
}
