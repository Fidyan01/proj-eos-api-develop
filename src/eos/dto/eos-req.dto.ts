import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsNumber,
  ValidateBy,
  buildMessage,
  IsNotEmpty,
  IsNumberString,
  Validate,
  IsOptional,
} from 'class-validator';
import { isIsoDate } from 'src/eos/utilities/helper';
import {
  ISO8601Field,
  IsNumberOrString,
  NumberField,
  StringField,
} from 'src/shares/decorators/field.decorator';
import { Transform } from "class-transformer";

export class WritetoBCReq {
  @ApiProperty({ required: true })
  @Validate(IsNumberOrString)
  @IsNotEmpty()
  EOSID: number;

  @ApiProperty({ required: true })
  @Validate(IsNumberOrString)
  @IsNotEmpty()
  EventSubStage: number;

  @ApiProperty({ required: true })
  @ISO8601Field()
  Timestamp: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Transform((value) => {
    if (value.obj[value.key] === null) {
      return 0;
    }
    return value.obj[value.key];
  })
  Field1?: number = 0;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform((value) => {
    if (value.obj[value.key] === null) {
      return 0;
    }
    return value.obj[value.key];
  })
  Field2?: number = 0;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform((value) => {
    if (value.obj[value.key] === null) {
      return 0;
    }
    return value.obj[value.key];
  })
  Field3?: number = 0;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform((value) => {
    if (value.obj[value.key] === null) {
      return 0;
    }
    return value.obj[value.key];
  })
  Field4?: number = 0;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(16)
  @Transform((value) => {
    if (value.obj[value.key] === null) {
      return '';
    }
    return value.obj[value.key];
  })
  Field5?: string = '';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  @Transform((value) => {
    if (value.obj[value.key] === null) {
      return '';
    }
    return value.obj[value.key];
  })
  Field6?: string = '';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(16)
  @Transform((value) => {
    if (value.obj[value.key] === null) {
      return '';
    }
    return value.obj[value.key];
  })
  Field7?: string = '';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  @Transform((value) => {
    if (value.obj[value.key] === null) {
      return '';
    }
    return value.obj[value.key];
  })
  Field8?: string = '';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  @Transform((value) => {
    if (value.obj[value.key] === null) {
      return '';
    }
    return value.obj[value.key];
  })
  Field9?: string = '';
}

export class ValidateBC extends WritetoBCReq {}

export class FilterEOSDTO {
  @ApiProperty({ required: false })
  @Validate(IsNumberOrString)
  @IsOptional()
  EOSID?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Validate(IsNumberOrString)
  EventSubStage?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  hashID?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  status?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  pendingTimeOverInSec?: number;
}

export class ResendEOSDTO {
  @ApiProperty({ required: true })
  @StringField()
  hashID?: string;
}
