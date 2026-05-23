import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RecipeIngredient } from '../../recipes/entities/recipe-ingredient.entity';

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 150 })
  name!: string;

  @Column({ unique: true, length: 150 })
  slug!: string;

  @OneToMany(() => RecipeIngredient, (ri) => ri.ingredient)
  recipeIngredients!: RecipeIngredient[];
}
