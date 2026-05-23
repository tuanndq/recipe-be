import { ApiProperty } from '@nestjs/swagger';

export class AdminProfileDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  username!: string;
}
