import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateUserPasswordDto {
  @ApiProperty({ name: 'old_password' })
  @IsString()
  old_password!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;
}

