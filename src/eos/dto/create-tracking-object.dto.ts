import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsNumber } from 'class-validator';

export class CreateDTO {
  @ApiProperty({ required: true })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  arrivalID: string;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  woid: string;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  prdID: string;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  eventStage: string;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  substage: string;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  timestamp: string;

  @ApiProperty({ required: true })
  @IsNumber()
  unixTime: number;
}
