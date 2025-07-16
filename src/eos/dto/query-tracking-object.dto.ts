import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsNumberString,
  Validate,
} from 'class-validator';
import { IsNumberOrString } from 'src/shares/decorators/field.decorator';

export class QueryDTO {
  @ApiProperty({ required: true })
  @Validate(IsNumberOrString)
  @MinLength(8)
  @MaxLength(64)
  @IsNotEmpty()
  arrivalID: string;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  woid: string;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  prdID: string;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  eventStage: string;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  substage: string;

  @ApiProperty({ required: true })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  timestamp: string;
}
