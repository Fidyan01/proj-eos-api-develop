import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsArray } from 'class-validator';

export class UpdateUserMeDTO {
  @ApiProperty({ required: true })
  @IsString()
  name: string;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;
}
