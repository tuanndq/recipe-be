import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InstructionStepResponseDto } from './instruction-step.dto';
import { RecipeIngredientResponseDto } from './recipe-ingredient.dto';

export class CuisineSummaryDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;
}

export class RecipeListItemDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional()
  description!: string | null;

  @ApiPropertyOptional()
  imageUrl!: string | null;

  @ApiProperty()
  cuisine!: CuisineSummaryDto;

  @ApiPropertyOptional()
  prepTimeMinutes!: number | null;

  @ApiPropertyOptional()
  cookTimeMinutes!: number | null;

  @ApiProperty()
  servings!: number;

  @ApiProperty()
  createdAt!: Date;
}

export class RecipeDetailDto extends RecipeListItemDto {
  @ApiProperty({ type: [RecipeIngredientResponseDto] })
  ingredients!: RecipeIngredientResponseDto[];

  @ApiProperty({ type: [InstructionStepResponseDto] })
  steps!: InstructionStepResponseDto[];

  @ApiProperty()
  updatedAt!: Date;
}
