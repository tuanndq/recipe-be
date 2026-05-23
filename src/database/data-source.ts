import { DataSource } from 'typeorm';
import { AdminUser } from '../auth/entities/admin-user.entity';
import { Cuisine } from '../cuisines/entities/cuisine.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { InstructionStep } from '../recipes/entities/instruction-step.entity';
import { RecipeIngredient } from '../recipes/entities/recipe-ingredient.entity';
import { Recipe } from '../recipes/entities/recipe.entity';

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME ?? 'recipe',
  password: process.env.DB_PASSWORD ?? 'recipe_secret',
  database: process.env.DB_DATABASE ?? 'recipe_db',
  entities: [
    AdminUser,
    Cuisine,
    Ingredient,
    Recipe,
    RecipeIngredient,
    InstructionStep,
  ],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
});
