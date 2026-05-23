import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export enum RecipeSortField {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  TITLE_ASC = 'title_asc',
  TITLE_DESC = 'title_desc',
}

export enum IngredientMatchMode {
  ANY = 'any',
  ALL = 'all',
}

export class QueryRecipesDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search in title and description' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Filter by cuisine IDs (comma-separated or repeated)',
    type: [Number],
    example: [1, 2],
  })
  @IsOptional()
  @Transform(({ value }) => normalizeToNumberArray(value))
  @IsArray()
  @IsInt({ each: true })
  cuisine?: number[];

  @ApiPropertyOptional({
    description: 'Filter by ingredient IDs (comma-separated or repeated)',
    type: [Number],
    example: [3, 5],
  })
  @IsOptional()
  @Transform(({ value }) => normalizeToNumberArray(value))
  @IsArray()
  @IsInt({ each: true })
  ingredient?: number[];

  @ApiPropertyOptional({
    enum: IngredientMatchMode,
    default: IngredientMatchMode.ANY,
    description: 'any = recipe has at least one ingredient; all = recipe has all listed ingredients',
  })
  @IsOptional()
  @IsEnum(IngredientMatchMode)
  ingredientMatch?: IngredientMatchMode = IngredientMatchMode.ANY;

  @ApiPropertyOptional({
    enum: RecipeSortField,
    default: RecipeSortField.NEWEST,
  })
  @IsOptional()
  @IsEnum(RecipeSortField)
  sort?: RecipeSortField = RecipeSortField.NEWEST;
}

function normalizeToNumberArray(value: unknown): number[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const arr = Array.isArray(value) ? value : String(value).split(',');
  return arr.map((v) => parseInt(String(v).trim(), 10)).filter((n) => !isNaN(n));
}
