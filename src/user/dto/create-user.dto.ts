import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDTO {
  @ApiProperty({ example: 'user 1', required: true })
  @IsString()
  name: string;

  @ApiProperty({ example: 'user1@gmail.com', required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  password: string;

  @ApiProperty({ example: `[1,2,3,4,5]`, required: true })
  @IsArray()
  roleIds: number[];
}
