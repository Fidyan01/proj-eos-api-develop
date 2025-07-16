import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNumberString, IsString, Validate } from 'class-validator';
import { IsNumberOrString } from 'src/shares/decorators/field.decorator';

export class QueryTimestampDTO {
  @ApiProperty({ required: true })
  @Validate(IsNumberOrString)
  EOSID: number;
}
