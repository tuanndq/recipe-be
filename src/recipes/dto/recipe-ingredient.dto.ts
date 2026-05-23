import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RecipeIngredientInputDto {
  @ApiProperty({ example: 1, description: 'Ingredient ID' })
  @IsInt()
  ingredientId!: number;

  @ApiPropertyOptional({ example: '2 cups' })
  @IsOptional()
  @IsString()
  quantity?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class RecipeIngredientResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  ingredientId!: number;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  quantity!: string | null;

  @ApiProperty()
  sortOrder!: number;
}
