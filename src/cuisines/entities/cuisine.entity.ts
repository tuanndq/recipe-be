import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Recipe } from '../../recipes/entities/recipe.entity';

@Entity('cuisines')
export class Cuisine {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 100 })
  name!: string;

  @Column({ unique: true, length: 100 })
  slug!: string;

  @OneToMany(() => Recipe, (recipe) => recipe.cuisine)
  recipes!: Recipe[];
}
