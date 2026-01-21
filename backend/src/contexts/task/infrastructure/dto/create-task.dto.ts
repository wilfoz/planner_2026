import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty()
  @IsInt()
  code!: number;

  @ApiProperty()
  @IsString()
  stage!: string;

  @ApiProperty()
  @IsString()
  group!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  unit!: string;
}

