import {
  Controller,
  Post,
  Body,
  ParseArrayPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import EosService from './eos.service';
import { QueryTimestampDTO } from 'src/eos/dto/query-timestamp.dto';
import {
  FilterEOSDTO,
  ResendEOSDTO,
  ValidateBC,
  WritetoBCReq,
} from 'src/eos/dto/eos-req.dto';
import {
  FilterEOSHeaderDTO,
  HeaderBCRequest,
  QueryHeaderBCRequest,
  ResendEOSHeaderDTO,
  ValidateHeaderBCResponse,
  WriteHeaderBCResponse,
} from './dto/header.dto';
import { EosHeader } from './entities/eos-header.entity';
import {
  QueryBCRes,
  ValidateBCRes,
  WritetoBCRes,
} from 'src/eos/dto/eos-res.dto';
import { EosV2 } from 'src/eos/entities/eos-v2.entity';
import { plainToInstance } from "class-transformer";

@Controller('eos')
@ApiTags('Eos')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
export class EosController {
  constructor(private readonly eosService: EosService) {}

  @Post('WriteHeaderBC')
  @ApiBody({
    type: HeaderBCRequest,
    isArray: true,
  })
  async writeHeaderBC(
    @Body(new ParseArrayPipe({ items: HeaderBCRequest }))
    header: HeaderBCRequest[],
  ): Promise<WriteHeaderBCResponse[]> {
    if (header.length >= 100)
      throw new BadRequestException('Accept < 100 records');
    return this.eosService.writeHeader(header);
  }

  @Post('ValidateHeaderBC')
  @ApiBody({
    type: HeaderBCRequest,
    isArray: true,
  })
  async validateHeaderBC(
    @Body(new ParseArrayPipe({ items: HeaderBCRequest }))
    header: HeaderBCRequest[],
  ): Promise<ValidateHeaderBCResponse[]> {
    if (header.length >= 100)
      throw new BadRequestException('Accept < 100 records');
    return this.eosService.validateHeader(header);
  }

  @Post('QueryHeaderBC')
  async queryHeaderBC(@Body() data: QueryHeaderBCRequest): Promise<any> {
    return this.eosService.getHeader(data.EOSID);
  }

  @Post('WritetoBC')
  @ApiOperation({
    description: 'write batch to BC',
  })
  @ApiBody({
    type: WritetoBCReq,
    isArray: true,
  })
  async batchWritetoBCV2(
    @Body(new ParseArrayPipe({ items: WritetoBCReq }))
    batchCreateDTO: WritetoBCReq[],
  ): Promise<WritetoBCRes[]> {
    if (batchCreateDTO.length >= 200)
      throw new BadRequestException('Accept < 200 records');
    return this.eosService.batchCreateEosRecordV2(
      plainToInstance(WritetoBCReq, batchCreateDTO),
    );
  }

  @Post('ValidateBC')
  @ApiBody({
    type: ValidateBC,
    isArray: true,
  })
  async batchValidateBCV2(
    @Body(new ParseArrayPipe({ items: WritetoBCReq }))
    batchQueryDTO: ValidateBC[],
  ): Promise<ValidateBCRes[]> {
    if (batchQueryDTO.length >= 200)
      throw new BadRequestException('Accept < 200 records');
    return this.eosService.validateBatchEosRecordV2(
      plainToInstance(WritetoBCReq, batchQueryDTO),
    );
  }

  @Post('QueryBC')
  @ApiBody({
    type: QueryTimestampDTO,
  })
  async queryDate(@Body() queryDTO: QueryTimestampDTO): Promise<QueryBCRes[]> {
    return this.eosService.getListDate(queryDTO.EOSID);
  }

  @Post('Filter')
  @ApiBody({
    type: FilterEOSDTO,
  })
  async getEos(@Body() filter: FilterEOSDTO): Promise<EosV2[]> {
    return this.eosService.filterEOS(filter);
  }

  @Post('ResendEOS')
  @ApiBody({
    type: ResendEOSDTO,
    isArray: true,
  })
  async resendEOSs(
    @Body(
      new ParseArrayPipe({
        items: ResendEOSDTO,
      }),
    )
    items: ResendEOSDTO[],
  ): Promise<void> {
    return this.eosService.resendEOSs(items);
  }

  @Post('FilterHeader')
  @ApiBody({
    type: FilterEOSHeaderDTO,
  })
  async getEosHeader(@Body() filter: FilterEOSHeaderDTO): Promise<EosHeader[]> {
    return this.eosService.filterEOSHeader(filter);
  }

  @Post('ResendEOSHeader')
  @ApiBody({
    type: ResendEOSHeaderDTO,
    isArray: true,
  })
  async resendEOSsHeader(
    @Body(
      new ParseArrayPipe({
        items: ResendEOSHeaderDTO,
      }),
    )
    items: ResendEOSHeaderDTO[],
  ): Promise<void> {
    return this.eosService.resendEOSHeaders(items);
  }
}
