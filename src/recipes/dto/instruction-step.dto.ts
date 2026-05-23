import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class InstructionStepInputDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  stepNumber!: number;

  @ApiProperty({ example: 'Preheat oven to 180°C.' })
  @IsString()
  @IsNotEmpty()
  instruction!: string;
}

export class InstructionStepResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  stepNumber!: number;

  @ApiProperty()
  instruction!: string;
}
