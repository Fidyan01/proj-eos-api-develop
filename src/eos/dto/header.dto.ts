import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsNumber,
  IsNumberString,
  IsNotEmpty,
  Validate,
  IsOptional,
} from 'class-validator';
import { EOSHeaderStatus } from '../utilities/eos.enum';
import {
  ISO8601Field,
  IsNumberOrString,
  NumberFieldOption,
  StringField,
  LessThanUint32
} from "src/shares/decorators/field.decorator";
import { Transform } from "class-transformer";

export class HeaderBCRequest {
  @ApiProperty({ required: true })
  @Validate(IsNumberOrString)
  @Validate(LessThanUint32)
  @IsNotEmpty()
  EOSID: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ISO8601Field()
  @Transform((value) => {
    if (value.obj[value.key] === null) {
      return '1970-01-01T00:00:00+00:00';
    }
    return value.obj[value.key];
  })
  StartOfTransaction?: string = '1970-01-01T00:00:00+00:00';

  @ApiProperty({ required: false })
  @IsOptional()
  @ISO8601Field()
  @Transform((value) => {
    if (value.obj[value.key] === null) {
      return '1970-01-01T00:00:00+00:00';
    }
    return value.obj[value.key];
  })
  EndOfTransaction?: string = '1970-01-01T00:00:00+00:00';

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
  ArrivalID?: string = '';

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
  Jetty?: string = '';

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
  VesselName?: string = '';

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
  TerminalName?: string = '';

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
  TraderName?: string = '';

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
  Agent?: string = '';

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
  Status?: string = '';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform((value) => {
    if (value.obj[value.key] === null) {
      return 0;
    }
    return value.obj[value.key];
  })
  BerthingPilotageID?: number = 0;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform((value) => {
    if (value.obj[value.key] === null) {
      return 0;
    }
    return value.obj[value.key];
  })
  VesselSize?: number = 0;

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
  PilotageLocationFrom1?: string = '';

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
  PilotageLocationTo1?: string = '';

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
  ArrivalStatus?: string = '';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Transform((value) => {
    if (value.obj[value.key] === null) {
      return 0;
    }
    return value.obj[value.key];
  })
  UnberthingPilotageID?: number = 0;

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
  PilotageLocationFrom2?: string = '';

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
  PilotageLocationTo2?: string = '';

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
  IMONumber?: string = '';
}

export class HeaderBCResponse {
  @ApiProperty()
  // @Validate(IsNumberOrString)
  EOSID: number;

  @ApiProperty()
  @IsString()
  StartOfTransaction: string;

  @ApiProperty()
  @IsString()
  EndOfTransaction: string;

  @ApiProperty()
  @IsString()
  HeaderStatus: EOSHeaderStatus;

  @ApiProperty()
  @IsNumber()
  ArrivalId: string;

  @ApiProperty()
  @IsNumber()
  VesselID: string;

  @ApiProperty()
  @IsString()
  Jetty: string;

  @ApiProperty()
  @IsNumber()
  TotalThroughput: string;

  @ApiProperty()
  @IsNumber()
  TotalDuration: string;

  @ApiProperty()
  @IsNumber()
  IMONumber: string;
}

export class ValidateHeaderBCResponse extends HeaderBCResponse {
  @ApiProperty()
  @IsString()
  Verified: string;

  @ApiProperty()
  @IsString()
  HashID: string;

  @ApiProperty()
  @IsString()
  TxHash: string;

  @ApiProperty()
  @IsString()
  Note: string;
}

export class WriteHeaderBCResponse extends HeaderBCResponse {
  @ApiProperty()
  @IsString()
  Stored: string;

  @ApiProperty()
  @IsString()
  HashID: string;
}

export class QueryHeaderBCRequest {
  @ApiProperty({ required: true })
  @Validate(IsNumberOrString)
  @Validate(LessThanUint32)
  @IsNotEmpty()
  EOSID: number;
}

export class FilterEOSHeaderDTO {
  @ApiProperty({ required: false })
  @Validate(IsNumberOrString)
  @Validate(LessThanUint32)
  @IsOptional()
  EOSID?: number;

  @ApiProperty({ required: false })
  @NumberFieldOption()
  status?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  hashID?: string;

  @ApiProperty({ required: false })
  @NumberFieldOption()
  pendingTimeOverInSec?: number;
}

export class ResendEOSHeaderDTO {
  @IsString()
  hashID?: string;
}
