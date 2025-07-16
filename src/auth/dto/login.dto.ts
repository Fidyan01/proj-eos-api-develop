import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDTO {
  @ApiProperty({ example: 'admin1@gmail.com', required: true })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({ example: 'admin123', required: true })
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
