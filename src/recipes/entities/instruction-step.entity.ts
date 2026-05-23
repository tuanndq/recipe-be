import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Recipe } from './recipe.entity';

@Entity('instruction_steps')
export class InstructionStep {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Recipe, (recipe) => recipe.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_id' })
  recipe!: Recipe;

  @Column({ name: 'recipe_id' })
  recipeId!: number;

  @Column({ name: 'step_number', type: 'int' })
  stepNumber!: number;

  @Column({ type: 'text' })
  instruction!: string;
}
