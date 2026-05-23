import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryIngredientsDto {
  @ApiPropertyOptional({ description: 'Filter by name (autocomplete)' })
  @IsOptional()
  @IsString()
  q?: string;
}
