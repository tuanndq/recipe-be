import { readFileSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { AdminUser } from '../../auth/entities/admin-user.entity';
import { Cuisine } from '../../cuisines/entities/cuisine.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { InstructionStep } from '../../recipes/entities/instruction-step.entity';
import { RecipeIngredient } from '../../recipes/entities/recipe-ingredient.entity';
import { Recipe } from '../../recipes/entities/recipe.entity';
import * as bcrypt from 'bcrypt';

const dataSource = new DataSource({
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
  synchronize: false,
});

interface SeedRecipe {
  title: string;
  description: string;
  imageUrl: string | null;
  cuisineSlug: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  ingredients: { slug: string; quantity: string }[];
  steps: { stepNumber: number; instruction: string }[];
}

async function seed() {
  await dataSource.initialize();
  console.log('Database connected');

  const seedsDir = join(__dirname);
  const cuisinesData = JSON.parse(
    readFileSync(join(seedsDir, 'cuisines.json'), 'utf-8'),
  ) as { name: string; slug: string }[];
  const ingredientsData = JSON.parse(
    readFileSync(join(seedsDir, 'ingredients.json'), 'utf-8'),
  ) as { name: string; slug: string }[];
  const recipesData = JSON.parse(
    readFileSync(join(seedsDir, 'recipes.json'), 'utf-8'),
  ) as SeedRecipe[];

  const cuisineRepo = dataSource.getRepository(Cuisine);
  const ingredientRepo = dataSource.getRepository(Ingredient);
  const recipeRepo = dataSource.getRepository(Recipe);
  const riRepo = dataSource.getRepository(RecipeIngredient);
  const stepRepo = dataSource.getRepository(InstructionStep);
  const adminRepo = dataSource.getRepository(AdminUser);

  for (const c of cuisinesData) {
    const exists = await cuisineRepo.findOne({ where: { slug: c.slug } });
    if (!exists) {
      await cuisineRepo.save(cuisineRepo.create(c));
    }
  }

  for (const i of ingredientsData) {
    const exists = await ingredientRepo.findOne({ where: { slug: i.slug } });
    if (!exists) {
      await ingredientRepo.save(ingredientRepo.create(i));
    }
  }

  const username = process.env.ADMIN_USERNAME ?? 'admin';
  const password = process.env.ADMIN_PASSWORD ?? 'admin123';
  const adminExists = await adminRepo.findOne({ where: { username } });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash(password, 10);
    await adminRepo.save(adminRepo.create({ username, passwordHash }));
    console.log(`Admin user created: ${username}`);
  }

  const cuisineMap = new Map(
    (await cuisineRepo.find()).map((c) => [c.slug, c.id]),
  );
  const ingredientMap = new Map(
    (await ingredientRepo.find()).map((i) => [i.slug, i.id]),
  );

  for (const r of recipesData) {
    const exists = await recipeRepo.findOne({ where: { title: r.title } });
    if (exists) continue;

    const cuisineId = cuisineMap.get(r.cuisineSlug);
    if (!cuisineId) {
      console.warn(`Skipping recipe ${r.title}: cuisine not found`);
      continue;
    }

    const recipe = await recipeRepo.save(
      recipeRepo.create({
        title: r.title,
        description: r.description,
        imageUrl: r.imageUrl,
        cuisineId,
        prepTimeMinutes: r.prepTimeMinutes,
        cookTimeMinutes: r.cookTimeMinutes,
        servings: r.servings,
      }),
    );

    for (const [index, ing] of r.ingredients.entries()) {
      const ingredientId = ingredientMap.get(ing.slug);
      if (!ingredientId) continue;
      await riRepo.save(
        riRepo.create({
          recipeId: recipe.id,
          ingredientId,
          quantity: ing.quantity,
          sortOrder: index,
        }),
      );
    }

    for (const step of r.steps) {
      await stepRepo.save(
        stepRepo.create({
          recipeId: recipe.id,
          stepNumber: step.stepNumber,
          instruction: step.instruction,
        }),
      );
    }

    console.log(`Seeded recipe: ${r.title}`);
  }

  await dataSource.destroy();
  console.log('Seed completed');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
