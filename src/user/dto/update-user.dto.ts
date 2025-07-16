import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsArray } from 'class-validator';

export class UpdateUserDTO {
  @ApiProperty({ required: true })
  @IsString()
  name: string;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;

  @ApiProperty({ example: `[1,2,3,4,5]`, required: true })
  @IsArray()
  roleIds: number[];
}
