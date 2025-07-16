import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class EncryptPrivateKeyDTO {
  @ApiProperty({ example: 'admin123', required: true })
  @IsNotEmpty()
  @IsString()
  readonly privateKey: string;
}
