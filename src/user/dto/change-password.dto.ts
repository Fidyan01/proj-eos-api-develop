import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDTO {
  @ApiProperty({ required: true })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  oldPassword: string;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  newPassword: string;
}
