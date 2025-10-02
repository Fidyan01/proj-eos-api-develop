import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, LessThan, Repository } from "typeorm";
import { Eos } from "./entities/eos.entity";
import { hashData } from "src/eos/utilities/keccac.utilities";
import { QueueService } from "src/queue/queue.service";
import {
  batchHeaderPayload,
  batchStoreTimestampsPayload,
  batchVerifyHeader,
  batchVerifyTimestamp,
  createTransaction,
  encodeStringToHex,
  estimatedGasForBatchHeaderPayload,
  estimatedGasForBatchStoreTimestampsPayload,
  getListEOS,
  getListEOSHeader,
  haveDuplicateEntry,
  ISO8601ToTimestamp,
  loadSmartContract
} from "src/eos/utilities/helper";
import { SystemConfigService } from "src/config/system-config.service";
import {
  SaveDataTimestampsDTO,
  StoreMetaTimestampsDTO,
  StoreTimestampsDTO
} from "src/eos/dto/batchUploadTimestamp.dto";
import { status } from "src/eos/utilities/eos.enum";

import { FilterEOSDTO, ResendEOSDTO, ValidateBC, WritetoBCReq } from "src/eos/dto/eos-req.dto";
import { QueryBCRes, ValidateBCRes, WritetoBCRes } from "src/eos/dto/eos-res.dto";
import { EosV2 } from "src/eos/entities/eos-v2.entity";
import { getPrivateKey } from "src/shares/helpers/encryption";
import { FilterEOSHeaderDTO, HeaderBCRequest, ResendEOSHeaderDTO, WriteHeaderBCResponse } from "src/eos/dto/header.dto";
import { EosHeader } from "./entities/eos-header.entity";
import { EEOSStatus } from "src/shares/enums/common.enum";
import { DEFAULT_BYTES16, DEFAULT_BYTES32, maxEOSMetaLen, maxEOSRecordLen } from "src/auth/constants";
import { plainToClass } from "class-transformer";
import Web3 from "web3";

@Injectable()
export default class EosService {
  constructor(
    @InjectRepository(Eos)
    private eosRepository: Repository<Eos>,
    @InjectRepository(EosV2)
    private eosV2Repository: Repository<EosV2>,
    @InjectRepository(EosHeader)
    private eosHeaderRepository: Repository<EosHeader>,
    private queueService: QueueService,
    private configService: SystemConfigService,
  ) {}

  // async createEosRecordV2(createDTO: WritetoBCReq): Promise<WritetoBCRes> {
  //   const hashID = hashData([
  //     createDTO.EOSID,
  //     createDTO.EventSubStage,
  //     createDTO.Timestamp,
  //   ]);

  //   const unixTime = await Math.floor(new Date(createDTO.Timestamp).getTime());

  //   if ((await this.eosV2Repository.count({ hashID: hashID })) != 0)
  //     return { EventSubStage: createDTO.EventSubStage, Stored: 'True' };

  //   await this.eosV2Repository.save({ ...createDTO, hashID: hashID });

  //   await this.queueService.transactionPushToQueue({
  //     hashID: hashID,
  //     unixTime,
  //   });

  //   // Send to queue

  //   return { EventSubStage: createDTO.EventSubStage, Stored: 'True' };
  // }

  async batchCreateEosRecordV2(
    batchCreateDTO: WritetoBCReq[],
  ): Promise<WritetoBCRes[]> {
    // validate input before processing
    this.validateWriteToBCInput(batchCreateDTO);

    if (batchCreateDTO.length > 200) {
      throw 'NO MORE THAN 200 EACH BATCH';
    }

    let validData: any[] = await this.validateWriteToBCInputData(
      batchCreateDTO,
    );
    if (validData.length !== batchCreateDTO.length) {
      throw new BadRequestException(
        'the same timestamps have been stored on chain',
      );
    }
    // format data and create hashID for each item.
    validData = validData.map((value) => {
      return {
        ...value,
        hashID: this.makeHashIDFromTimestamp(value),
      };
    });

    // save data to database
    const savedData = [];
    for (const record of validData) {
      const oldRecord = await this.eosV2Repository.findOne({
        where: {
          EOSID: record.EOSID,
          EventSubStage: record.EventSubStage,
        },
      });
      if (oldRecord) {
        savedData.push(oldRecord);
      } else {
        savedData.push(await this.eosV2Repository.save(record as EosV2));
      }
    }

    // format data before sending to queue
    // this step will collect all the same EOSID items to easier handle data
    // the formatted data will be this form: EOSID => WritetoBCReq[]
    const formattedData = Object.entries(
      this.formatWriteToBCRecords(validData),
    );

    /**
     * notice: the tochainData and tochainMetaData dont related with each other, because we
     * need to optimize the gas used, so if the item hasn't additional infors, we dont push it to blockchain
     * Below we format toChainData (addInfors) and toChainMetaData
     */
    const toChainData = this.formatDataToChainWriteToBC(formattedData);
    const toChainMetaData = this.formatMetaDataToChainWriteToBC(formattedData);

    // push data to queue
    await this.queueService.batchTransactionPushToQueue({
      toChainData: {
        data: toChainData,
        metaData: toChainMetaData,
      },
      ids: savedData.map((e) => e.id),
    });

    // format and return response
    return validData.map((item) => ({
      EventSubStage: item.EventSubStage,
      Stored: 'True',
      HashID: item.hashID,
    }));
  }

  // validate timestamps on chain
  private async validateWriteToBCInputData(
    rawData: WritetoBCReq[],
  ): Promise<WritetoBCReq[]> {
    const data: WritetoBCReq[] = [];
    // validate input before processing
    for (const item of rawData) {
      if (isNaN(Number(item.EOSID)))
        throw new BadRequestException('Input data invalid, field EOSID');

      if (isNaN(Number(item.EventSubStage)))
        throw new BadRequestException(
          'Input data invalid, field EventSubStage',
        );

      // check item has been stored on db. if item has been stored on db, just skip it.
      const isExist = await this.eosV2Repository.findOne({
        where: { EOSID: item.EOSID, EventSubStage: item.EventSubStage, status: EEOSStatus.SUCCEED },
      });
      if (isExist) continue;

      data.push({ ...item });
    }
    return data;
  }

  /**
   * The function formats raw data into a specific structure before sending it to the blockchain.
   * @param {any} raw - The `raw` parameter is of type `any` and represents the raw data that needs to
   * be formatted before sending it to the blockchain.
   * @returns an array of objects of type `StoreTimestampsDTO[]`.
   */
  private formatDataToChainWriteToBC(raw: any): StoreTimestampsDTO[] {
    const toChainData: StoreTimestampsDTO[] = [];

    for (const [key, value] of raw) {
      const dataFormatted = [];
      (value as Array<WritetoBCReq>).forEach((item) => {
        // we ignore all items dont have the data
        if (
          !item.Field1 &&
          !item.Field2 &&
          !item.Field3 &&
          !item.Field4 &&
          !item.Field5 &&
          !item.Field6 &&
          !item.Field7 &&
          !item.Field8 &&
          !item.Field9
        )
          return;
        dataFormatted.push(item);
      });

      const formattedLength = dataFormatted.length;
      if (formattedLength === 0) continue;
      // format data before sending to on-chain based on the struct in SC
      for (let i = 0; i < formattedLength; i = i + maxEOSRecordLen) {
        // We split all of items to multiple object, one object will have max 6 sub items
        const data = {
          EOSID: Number(key),
          info: this.generateInfoObject(dataFormatted, i, maxEOSRecordLen),
        };
        toChainData.push(data);
      }
    }

    return toChainData;
  }

  /**
   * The function `formatMetaDataToChainWriteToBC` takes in raw data and formats it into an array of
   * `StoreMetaTimestampsDTO` objects to be written to a blockchain.
   * @param {any} raw - The `raw` parameter is of type `any`, which means it can be any data type. It is
   * used as input to the `formatMetaDataToChainWriteToBC` function.
   * @returns an array of objects of type `StoreMetaTimestampsDTO[]`.
   */
  private formatMetaDataToChainWriteToBC(raw: any): StoreMetaTimestampsDTO[] {
    const toChainData: StoreMetaTimestampsDTO[] = [];

    for (const [key, value] of raw) {
      const len = (value as Array<WritetoBCReq>).length;

      for (let i = 0; i < len; i = i + maxEOSMetaLen) {
        // We combine 5 sub items in one big object
        toChainData.push({
          EOSID: Number(key),
          info: this.generateInfoMetaObject(value, i, maxEOSMetaLen),
        });
      }
    }

    return toChainData;
  }

  /**
   * The function generates a meta object with event substage and timestamp information based on the
   * given value array.
   * @param {any} value - The `value` parameter is an array of objects. Each object represents a record
   * and contains properties such as `EventSubStage` and `Timestamp`.
   * @param {number} startIndex - The `startIndex` parameter is the index at which the loop should
   * start iterating over the `value` array. It determines the starting point for extracting data from
   * the `value` array and populating the `metaObject` with the corresponding values.
   * @param {number} maxEOSMetaRecordLen - The parameter `maxEOSMetaRecordLen` represents the maximum
   * number of meta records that can be generated.
   * @returns a metaObject, which is an object containing eventSubStage and timestamp properties.
   */
  private generateInfoMetaObject(
    value: any,
    startIndex: number,
    maxEOSMetaRecordLen: number,
  ) {
    const metaObject: any = {};

    for (let j = 0; j < maxEOSMetaRecordLen; j++) {
      const dataIndex = startIndex + j;
      const eventKey = `eventSubStage${j + 1}`;
      const timestampKey = `timestamp${j + 1}`;
      const dataExists = dataIndex < value.length;

      metaObject[eventKey] = dataExists ? value[dataIndex].EventSubStage : 0;
      metaObject[timestampKey] = dataExists
        ? Math.floor(new Date(value[dataIndex].Timestamp).getTime())
        : 0;
    }

    return metaObject;
  }

  /**
   * The function `generateInfoObject` takes in an array of values, a start index, and a maximum record
   * length, and returns an object with properties based on the values in the array.
   * @param {any} value - The `value` parameter is an array of objects. Each object represents a record
   * and contains properties such as `EventSubStage`, `Field1`, `Field2`, `Field3`, `Field4`, `Field5`,
   * `Field6`, `Field7`, `Field8`, and `Field9`
   * @param {number} startIndex - The `startIndex` parameter is the index at which the data should
   * start being extracted from the `value` array.
   * @param {number} maxEOSRecordLen - The parameter `maxEOSRecordLen` represents the maximum number of
   * EOS records that can be generated in the `infoObject`.
   * @returns an object containing information about events.
   */
  private generateInfoObject(
    value: any,
    startIndex: number,
    maxEOSRecordLen: number,
  ): any {
    const infoObject: any = {};

    for (let j = 0; j < maxEOSRecordLen; j++) {
      const dataIndex = startIndex + j;
      const eventKey = `e${j + 1}`;
      const dataExists = dataIndex < value.length;

      infoObject[eventKey] = {
        eventSubStage: dataExists ? value[dataIndex].EventSubStage : 0,
        field1: dataExists ? value[dataIndex].Field1 : 0,
        field2: dataExists ? value[dataIndex].Field2 : 0,
        field3: dataExists ? value[dataIndex].Field3 : 0,
        field4: dataExists ? value[dataIndex].Field4 : 0,
        field5: dataExists
          ? encodeStringToHex(value[dataIndex].Field5, 32)
          : DEFAULT_BYTES32,
        field6: dataExists
          ? encodeStringToHex(value[dataIndex].Field6)
          : DEFAULT_BYTES16,
        field7: dataExists
          ? encodeStringToHex(value[dataIndex].Field7)
          : DEFAULT_BYTES16,
        field8: dataExists
          ? encodeStringToHex(value[dataIndex].Field8)
          : DEFAULT_BYTES16,
        field9: dataExists
          ? encodeStringToHex(value[dataIndex].Field9)
          : DEFAULT_BYTES16,
      };
    }

    return infoObject;
  }

  // validate by batch on chain
  async validateBatchEosRecordV2(
    batchQueryDTO: ValidateBC[],
  ): Promise<ValidateBCRes[]> {
    this.validateWriteToBCInput(batchQueryDTO);

    // format data before sending to on chain base on struct in SC
    const formattedData = batchQueryDTO.map((value) => {
      return {
        eosId: value.EOSID,
        eventSubStage: value.EventSubStage,
        timestamp: Math.floor(new Date(value.Timestamp).getTime() / 1000),

        field1: value.Field1 ?? 0,
        field2: value.Field2 ?? 0,
        field3: value.Field3 ?? 0,
        field4: value.Field4 ?? 0,

        field5: value.Field5 ? encodeStringToHex(value.Field5, 32) : "0x" + "00".repeat(32),
        field6: value.Field6 ? encodeStringToHex(value.Field6, 16) : "0x" + "00".repeat(16),
        field7: value.Field7 ? encodeStringToHex(value.Field7, 16) : "0x" + "00".repeat(16),
	field8: value.Field8 ? encodeStringToHex(value.Field8, 16) : "0x" + "00".repeat(16),
        field9: value.Field9 ? encodeStringToHex(value.Field9, 16) : "0x" + "00".repeat(16),

        hashId: this.makeHashIDFromTimestamp(value),
      };
    });
    console.log('formattedData', formattedData);
    // check on blockchain level
    const statuses = await batchVerifyTimestamp(
      formattedData,
      this.configService.provider,
      this.configService.smartcontract,
    );
    const txHashes = [];
    const notes = [];
    for (let i = 0; i < formattedData.length; i++) {
      console.log("formattedData status2");
      const data = await this.eosV2Repository.findOne({
        where: {
          EOSID: formattedData[i].eosId,
          EventSubStage: formattedData[i].eventSubStage,
        },
      });
      txHashes.push(data?.txHash);
      notes.push(data?.note);
    }

    // format data and return response
    return statuses.map((status, i) => {
      console.log("formattedData status3");
      return {
        EventSubStage: batchQueryDTO[i].EventSubStage,
        Verified: status == 'Y' ? 'True' : 'False',
        HashID: formattedData[i].hashId,
        TxHash: txHashes[i],
        Note: notes[i],
      };
    });
  }

  // listen event from queue and send to on chain
  async submitBatchHashOnchain(
    ids: number[],
    storeTimestampsDTO: SaveDataTimestampsDTO,
  ): Promise<any> {
    if (storeTimestampsDTO.metaData.length === 0) return;
     console.log("submitBatchHashOnchain 1",storeTimestampsDTO.metaData.length);
    // create payload from data to send to on chain
    const payload = await batchStoreTimestampsPayload(storeTimestampsDTO);



    let estimatedGas;
    // try 4 times
    // try estimate gas
    for (let i = 0; i < 1; i++) {
      try {
        estimatedGas = await estimatedGasForBatchStoreTimestampsPayload(
          storeTimestampsDTO,
          this.configService.smartcontract,
          this.configService.sender,
          this.configService.provider,
        );
        break;
      } catch (err) {
        console.log('system is down please try again.', err.message);
      }
    }

    const provider = new Web3.providers.HttpProvider(
      this.configService.provider,
    );
    const web3 = new Web3(provider);

    // submit transaction
    try {
      const signedTx = await createTransaction(
        getPrivateKey(),
        this.configService.smartcontract,
        payload,
        this.configService.provider,
        estimatedGas,
      );
      await this.updateHashIdTxHash(ids, signedTx.transactionHash);
      await web3.eth.sendSignedTransaction(signedTx.rawTransaction || '');

      await this.updateHashIdStatus(ids, EEOSStatus.SUCCEED);
    } catch (e) {
      console.log("e", e);
      await this.updateHashIdStatus(ids, EEOSStatus.FAILED, JSON.stringify(e));
    }
  }

  async getListDate(EOSID: number): Promise<QueryBCRes[]> {
    return getListEOS(
      EOSID,
      this.configService.provider,
      this.configService.smartcontract,
    );
  }

  async eosEventHandler(from: number, to: number): Promise<void> {
    // load smart contract instance
    const scInstance = loadSmartContract(
      this.configService.provider,
      this.configService.smartcontract,
    );
    const events = await scInstance.getPastEvents('allEvents', {
      fromBlock: from,
      toBlock: to,
    });

    // Create transaction
    for (const event of events) {
      if (event.event == 'DataPublishEvent') {
        let hashId = event.returnValues['hashID'].toLowerCase();

        if (!hashId.contains('0x')) {
          hashId = '0x' + hashId;
        }

        const data = await this.eosRepository.findOne(hashId);

        if (data) {
          data.status = status.SUCCESS;
          await this.eosRepository.save(data);
        }
      }
    }
    // Get new event
  }

  //write header function
  async writeHeader(
    headers: HeaderBCRequest[],
  ): Promise<WriteHeaderBCResponse[]> {
    const res = [];
    const listHeaders = [];
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      // check in database. if it was not exists, create a new item, else update it.
      let headerEOSById = await this.eosHeaderRepository.findOne({
        EOSID: header.EOSID.toString(),
      });
      if (headerEOSById) {
        if (headerEOSById.RecordStatus === EEOSStatus.SUCCEED) {
          throw new BadRequestException(
            'header already exists, EOSID: ' + header.EOSID,
          );
        }
      } else {
        headerEOSById = new EosHeader();
      }
      headerEOSById.EOSID = header.EOSID.toString();
      // update and format data
      headerEOSById.StartOfTransaction = header.StartOfTransaction
        ? ISO8601ToTimestamp(header.StartOfTransaction).toString()
        : headerEOSById.StartOfTransaction;
      headerEOSById.EndOfTransaction = header.EndOfTransaction
        ? ISO8601ToTimestamp(header.EndOfTransaction).toString()
        : headerEOSById.EndOfTransaction;
      headerEOSById.Status = header.Status ?? headerEOSById.Status;
      headerEOSById.ArrivalID = header.ArrivalID ?? headerEOSById.ArrivalID;
      headerEOSById.IMONumber = header.IMONumber ?? headerEOSById.IMONumber;
      headerEOSById.VesselName = header.VesselName ?? headerEOSById.VesselName;
      headerEOSById.Jetty = header.Jetty ?? headerEOSById.Jetty;
      headerEOSById.TerminalName =
        header.TerminalName ?? headerEOSById.TerminalName;
      headerEOSById.TraderName = header.TraderName ?? headerEOSById.TraderName;
      headerEOSById.Agent = header.Agent ?? headerEOSById.Agent;
      headerEOSById.Status = header.Status ?? headerEOSById.Status;
      headerEOSById.BerthingPilotageID =
        header.BerthingPilotageID ?? headerEOSById.BerthingPilotageID;
      headerEOSById.VesselSize = header.VesselSize ?? headerEOSById.VesselSize;
      headerEOSById.PilotageLocationFrom1 =
        header.PilotageLocationFrom1 ?? headerEOSById.PilotageLocationFrom1;
      headerEOSById.PilotageLocationTo1 =
        header.PilotageLocationTo1 ?? headerEOSById.PilotageLocationTo1;
      headerEOSById.ArrivalStatus =
        header.ArrivalStatus ?? headerEOSById.ArrivalStatus;
      headerEOSById.UnberthingPilotageID =
        header.UnberthingPilotageID ?? headerEOSById.UnberthingPilotageID;
      headerEOSById.PilotageLocationFrom2 =
        header.PilotageLocationFrom2 ?? headerEOSById.PilotageLocationFrom2;
      headerEOSById.PilotageLocationTo2 =
        header.PilotageLocationTo2 ?? headerEOSById.PilotageLocationTo2;

      // create hashID for this item
      headerEOSById.HashID = this.makeHashIDFromHeader(headerEOSById);

      // push item to list for processing
      listHeaders.push(headerEOSById);
    }

    // check duplicate record.
    const hashIds = listHeaders.map((e) => e.HashID);
    if (haveDuplicateEntry(hashIds))
      throw new BadRequestException('Input data invalid, same data');

    // save item into DB
    const response = await this.eosHeaderRepository.save(listHeaders);
    const resFormat = response.map((el) => {
      el['Stored'] = 'True';
      return el;
    });
    // push item to queue for processing.
    await this.queueService.addWriteHeaderToQueue(listHeaders);
    return resFormat;
  }

  //validate header function
  async validateHeader(headers: HeaderBCRequest[]): Promise<any> {
    const listHash = [];
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      // format ISO8601 to timestamp
      header.StartOfTransaction = ISO8601ToTimestamp(
        header.StartOfTransaction,
      ).toString();
      header.EndOfTransaction = ISO8601ToTimestamp(
        header.EndOfTransaction,
      ).toString();
      // re-create hashID for this item and push to list for processing
      const hashID = this.makeHashIDFromHeader(header);
      listHash.push(hashID);
    }

    //check duplicate record.
    if (haveDuplicateEntry(listHash))
      throw new BadRequestException('Input data invalid, same data');

    // call to contract for batch verify
    const statuses = await batchVerifyHeader(
      listHash,
      this.configService.provider,
      this.configService.smartcontract,
    );
    //handle response
    const res = [];
    for (const [i, header] of headers.entries()) {
      header['Verified'] = statuses[i] == 'Y' ? 'True' : 'False';
      header['HashID'] = listHash[i];
      const data = await this.eosHeaderRepository.findOne({
        where: { HashID: listHash[i] },
      });
      header['TxHash'] = data?.txHash;
      header['Note'] = data?.note;

      res.push(header);
    }
    return res;
  }

  // get all header item by EOSID

  async getHeader(id: number): Promise<EosHeader> {
    //get all header item by EOSID in contract
    const header = await getListEOSHeader(
      id,
      this.configService.provider,
      this.configService.smartcontract,
    );
    return header;
  }

  // function will be used in queue to push header onchain.
  async submitBatchHeaderOnchain(data: EosHeader[]): Promise<any> {
    const headers = data.map((header) => {
      const tmpTxnHeader1 = {
        eosId: +header.EOSID,
        startOfTransaction: +header.StartOfTransaction,
        endOfTransaction: +header.EndOfTransaction,
        imoNumber: header.IMONumber,
        arrivalID: header.ArrivalID,
        jetty: header.Jetty,
        hashID: header.HashID,
        vesselName: header.VesselName,
        terminalName: header.TerminalName,
        traderName: header.TraderName,
        agent: header.Agent,
        status: header.Status,
        berthingPilotageID: header.BerthingPilotageID,
        vesselSize: header.VesselSize,
      };

      const tmpTxnHeader2 = {
        pilotageLocationFrom1: header.PilotageLocationFrom1,
        pilotageLocationTo1: header.PilotageLocationTo1,
        arrivalStatus: header.ArrivalStatus,
        unberthingPilotageID: header.UnberthingPilotageID,
        pilotageLocationFrom2: header.PilotageLocationFrom2,
        pilotageLocationTo2: header.PilotageLocationTo2,
      };
      return {
        p1: tmpTxnHeader1,
        p2: tmpTxnHeader2,
      };
    });
    const hashIds = headers.map((e) => e.p1.hashID);
    // create payload for add header onchain
    const payload = await batchHeaderPayload(headers);

    let estimatedGas;
    // try 4 times
    for (let i = 0; i < 4; i++) {
      try {
        estimatedGas = await estimatedGasForBatchHeaderPayload(
          headers,
          this.configService.smartcontract,
          this.configService.sender,
          this.configService.provider,
        );
        break;
      } catch (err) {
        console.log('system is down please try again.', err.message);
      }
    }

    const provider = new Web3.providers.HttpProvider(
      this.configService.provider,
    );
    const web3 = new Web3(provider);

    // submit transaction on chain
    try {
      const signedTx = await createTransaction(
        getPrivateKey(),
        this.configService.smartcontract,
        payload,
        this.configService.provider,
        estimatedGas,
      );
      await this.updateHashHeaderTxHash(hashIds, signedTx.transactionHash);

      await web3.eth.sendSignedTransaction(signedTx.rawTransaction || '');
      await this.updateHashHeaderIdStatus(hashIds, EEOSStatus.SUCCEED);
    } catch (e) {
      console.log(e);
      await this.updateHashHeaderIdStatus(
        hashIds,
        EEOSStatus.FAILED,
        JSON.stringify(e),
      );
    }
  }

  formatTime(timeString: string) {
    const [hourString, minute] = timeString.split(':');
    const hour = +hourString % 24;
    return (hour % 12 || 12) + ':' + minute + (hour < 12 ? 'am' : 'pm');
  }

  validateWriteToBCInput(array: WritetoBCReq[]) {
    const set = new Set();
    for (const value of array) {
      const key = hashData([
        value.EOSID.toString() + '===' + value.EventSubStage.toString(),
      ]);
      if (set.has(key))
        throw new BadRequestException(
          'Invalid input, the same combine of EOSID and EventSubStage',
        );
      set.add(key);
    }
  }

  async filterEOS(filter: FilterEOSDTO): Promise<EosV2[]> {
    const conditions = {};
    if (!isNaN(filter.EOSID)) {
      conditions['EOSID'] = filter.EOSID.toString();
    }

    if (filter.hashID !== undefined) {
      conditions['hashID'] = filter.hashID.toString();
    }

    if (!isNaN(filter.EventSubStage)) {
      conditions['EventSubStage'] = filter.EventSubStage;
    }

    if (!isNaN(filter.status)) {
      conditions['status'] = filter.status;
    }

    if (!isNaN(filter.pendingTimeOverInSec)) {
      const now = new Date().getTime();
      const checkpointTime = new Date(now - filter.pendingTimeOverInSec * 1000);
      conditions['updatedAt'] = LessThan(checkpointTime);
    }

    return this.eosV2Repository.find({
      where: conditions,
    });
  }

  // check and resend timestamp item if item is failed in database.
  async resendEOSs(items: ResendEOSDTO[]): Promise<any> {
    if (!items.length) return;
    const ids = items.map((e) => e.hashID);
    // get list resend items.
    const listResendItems = await this.eosV2Repository.find({
      where: {
        hashID: In(ids),
      },
    });
    if (!listResendItems.length) return;

    const formattedData = Object.entries(
      this.formatWriteToBCRecords(listResendItems as any),
    );

    const toChainData = this.formatDataToChainWriteToBC(formattedData);
    const toChainMetaData = this.formatMetaDataToChainWriteToBC(formattedData);

    // push data to queue
    await this.queueService.batchTransactionPushToQueue({
      toChainData: {
        data: toChainData,
        metaData: toChainMetaData,
      },
      ids: listResendItems.map((e) => e.id),
    });

    // format and return response
    return listResendItems.map((item) => ({
      EventSubStage: item.EventSubStage,
      Stored: 'True',
      HashID: item.hashID,
    }));
  }

  // update status of timestamp by id.
  async updateHashIdStatus(ids: number[], status: EEOSStatus, note = ''): Promise<void> {
    const qb = this.eosV2Repository.createQueryBuilder();
    await qb
      .update()
      .set({
        status,
        note,
      })
      .where('id IN (:...ids)', { ids })
      .execute();
  }

  async updateHashIdTxHash(ids: number[], txHash: string): Promise<void> {
    const qb = this.eosV2Repository.createQueryBuilder();
    await qb
      .update()
      .set({
        txHash,
      })
      .where('id IN (:...ids)', { ids })
      .execute();
  }

  // update status of header by id.
  async updateHashHeaderIdStatus(
    hashIds: string[],
    status: EEOSStatus,
    note = '',
  ): Promise<void> {
    const qb = this.eosHeaderRepository.createQueryBuilder();
    await qb
      .update()
      .set({
        RecordStatus: status,
        note,
      })
      .where('hash_id IN (:...hashIds)', { hashIds })
      .execute();
  }

  async updateHashHeaderTxHash(hashIds: string[], txHash: string) {
    const qb = this.eosHeaderRepository.createQueryBuilder();
    await qb
      .update()
      .set({
        txHash: txHash,
      })
      .where('hash_id IN (:...hashIds)', { hashIds })
      .execute();
  }

  async filterEOSHeader(filter: FilterEOSHeaderDTO): Promise<EosHeader[]> {
    const conditions = {};
    if (!isNaN(filter.EOSID)) {
      conditions['EOSID'] = filter.EOSID.toString();
    }

    if (filter.hashID !== undefined) {
      conditions['hashID'] = filter.hashID.toString();
    }

    if (!isNaN(filter.status)) {
      conditions['RecordStatus'] = filter.status;
    }

    if (!isNaN(filter.pendingTimeOverInSec)) {
      const now = new Date().getTime();
      const checkpointTime = new Date(now - filter.pendingTimeOverInSec * 1000);
      conditions['updatedAt'] = LessThan(checkpointTime);
    }

    return this.eosHeaderRepository.find({
      where: conditions,
    });
  }

  // resend header in to onchain if item is failed in database.
  async resendEOSHeaders(items: ResendEOSHeaderDTO[]): Promise<void> {
    if (!items.length) return;
    const hashIds = items.map((e) => e.hashID);
    const listResendItems = await this.eosHeaderRepository.find({
      where: {
        HashID: In(hashIds),
      },
    });
    if (!listResendItems.length) return;

    return this.queueService.addWriteHeaderToQueue(listResendItems);
  }

  formatWriteToBCRecords(
    batchCreateDTO: WritetoBCReq[],
  ): {
    [key: number]: WritetoBCReq[];
  } {
    const tData = {};
    batchCreateDTO.forEach((value) => {
      if (!tData[value.EOSID]) {
        tData[value.EOSID] = [];
      }
      tData[value.EOSID].push(plainToClass(WritetoBCReq, value));
    });

    return tData;
  }

  // make hashID from header
  makeHashIDFromHeader(header: Partial<EosHeader>) {
    return hashData([
      header.EOSID.toString(),
      header.StartOfTransaction.toString(),
      header.EndOfTransaction.toString(),
      header.ArrivalID.toString(),
      header.IMONumber.toString(),
      header.VesselName.toString(),
      header.Jetty.toString(),
      header.TerminalName.toString(),
      header.TraderName.toString(),
      header.Agent.toString(),
      header.Status.toString(),
      header.BerthingPilotageID.toString(),
      header.VesselSize.toString(),
      header.PilotageLocationFrom1.toString(),
      header.PilotageLocationTo1.toString(),
      header.ArrivalStatus.toString(),
      header.UnberthingPilotageID.toString(),
      header.PilotageLocationFrom2.toString(),
      header.PilotageLocationTo2.toString(),
    ]);
  }

  // make hashID from timestamp
  makeHashIDFromTimestamp(value: Partial<WritetoBCReq>) {
    return hashData([
      value.EOSID.toString(),
      value.EventSubStage.toString(),
      value.Timestamp,
      value.Field1 ? value.Field1.toString() : '',
      value.Field2 ? value.Field2.toString() : '',
      value.Field3 ? value.Field3.toString() : '',
      value.Field4 ? value.Field4.toString() : '',
      value.Field5 && value.Field5.length ? value.Field5.toString() : '',
      value.Field6 && value.Field6.length ? value.Field6.toString() : '',
      value.Field7 && value.Field7.length ? value.Field7.toString() : '',
      value.Field8 && value.Field8.length ? value.Field8.toString() : '',
      value.Field9 && value.Field9.length ? value.Field9.toString() : '',
    ]);
  }
}
