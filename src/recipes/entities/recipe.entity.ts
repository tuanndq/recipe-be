import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cuisine } from '../../cuisines/entities/cuisine.entity';
import { InstructionStep } from './instruction-step.entity';
import { RecipeIngredient } from './recipe-ingredient.entity';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl!: string | null;

  @Column({ name: 'prep_time_minutes', type: 'int', nullable: true })
  prepTimeMinutes!: number | null;

  @Column({ name: 'cook_time_minutes', type: 'int', nullable: true })
  cookTimeMinutes!: number | null;

  @Column({ type: 'tinyint', default: 1 })
  servings!: number;

  @ManyToOne(() => Cuisine, (cuisine) => cuisine.recipes, { eager: true })
  @JoinColumn({ name: 'cuisine_id' })
  cuisine!: Cuisine;

  @Column({ name: 'cuisine_id' })
  cuisineId!: number;

  @OneToMany(() => RecipeIngredient, (ri) => ri.recipe, {
    cascade: true,
    eager: true,
  })
  recipeIngredients!: RecipeIngredient[];

  @OneToMany(() => InstructionStep, (step) => step.recipe, {
    cascade: true,
    eager: true,
  })
  steps!: InstructionStep[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
