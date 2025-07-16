import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class WritetoBCRes {
  @ApiProperty()
  @IsNumber()
  EventSubStage: number;

  @ApiProperty()
  @IsString()
  Stored: string;

  @ApiProperty()
  @IsString()
  HashID: string;
}

export class ValidateBCRes {
  @ApiProperty()
  @IsNumber()
  EventSubStage: number;

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

export class QueryBCRes {
  @ApiProperty()
  @IsString()
  EOSID: string;

  @ApiProperty()
  @IsString()
  EventSubStage: string;

  @ApiProperty()
  @IsString()
  Timestamp: string;

  // Field 1 to Field 9
  @ApiProperty()
  @IsNumber()
  Field1?: number;

  @ApiProperty()
  @IsNumber()
  Field2?: number;

  @ApiProperty()
  @IsNumber()
  Field3?: number;

  @ApiProperty()
  @IsNumber()
  Field4?: number;

  @ApiProperty()
  @IsString()
  Field5?: string;

  @ApiProperty()
  @IsString()
  Field6?: string;

  @ApiProperty()
  @IsString()
  Field7?: string;

  @ApiProperty()
  @IsString()
  Field8?: string;

  @ApiProperty()
  @IsString()
  Field9?: string;
}
