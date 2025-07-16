import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsNumber } from 'class-validator';

export class ResponseCreateDTO {
  @ApiProperty()
  @IsString()
  arrivalID: string;

  @ApiProperty()
  @IsString()
  woid: string;

  @ApiProperty()
  @IsString()
  prdID: string;

  @ApiProperty()
  @IsString()
  eventStage: string;

  @ApiProperty()
  @IsString()
  substage: string;

  @ApiProperty()
  @IsString()
  timestamp: string;

  @ApiProperty()
  @IsString()
  hashID: string;
}
