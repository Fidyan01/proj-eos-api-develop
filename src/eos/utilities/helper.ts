import Web3 from 'web3';
import { AbiItem, toBN } from 'web3-utils';
import { BN } from 'bn.js';
import TimestampTrackingForEOS from './TimestampTrackingForEOS.json';
import { SaveDataTimestampsDTO } from 'src/eos/dto/batchUploadTimestamp.dto';
import { QueryBCRes } from 'src/eos/dto/eos-res.dto';
import { maxEOSMetaLen, maxEOSRecordLen } from '../../auth/constants';

export async function createTransaction(
  senderPkey: string,
  scAddress: string,
  payload: string,
  providerUrl: string,
  estimatedGas?: number,
) {
  const provider = new Web3.providers.HttpProvider(providerUrl);
  const web3 = new Web3(provider);

  // const gasLimit = web3.utils.toBN(100);

  let gasPrice: string;

  const maxLimit = 10000000000;
  const normalLimit = 10000000;

  let gasLimit;

  //259161960772
  gasPrice = await web3.eth.getGasPrice();

  gasPrice = web3.utils.toBN(gasPrice).mul(toBN(3)).div(toBN(2)).toString();

  gasLimit = estimatedGas ? estimatedGas : normalLimit;
  gasLimit = gasLimit * 2;
  if (gasLimit > maxLimit) {
    gasLimit = maxLimit;
  }

  const nonce = await web3.eth.getTransactionCount(
    web3.eth.accounts.privateKeyToAccount(senderPkey).address,
    'pending',
  );
  const rawTx = {
    to: scAddress,
    data: payload,
    nonce: nonce,
    gasLimit: web3.utils.toHex(gasLimit),
    chainId: await web3.eth.getChainId(),
    gasPrice: gasPrice,
  };

  return web3.eth.accounts.signTransaction(rawTx, senderPkey);
}
export function loadSmartContract(provider?: string, scAddress?: string) {
  const web3 = provider ? new Web3(provider) : new Web3();
  const smartcontract = TimestampTrackingForEOS;

  return scAddress
    ? new web3.eth.Contract(smartcontract.abi as AbiItem[], scAddress)
    : new web3.eth.Contract(smartcontract.abi as AbiItem[]);
}

export async function verifyTimestamp(
  hashID: string,
  provider: string,
  scAddress: string,
): Promise<string> {
  const scInstance = loadSmartContract(provider, scAddress);

  const ret = await scInstance?.methods.verifyTimestamp(hashID).call();
  return ret ? 'Y' : 'N';
}

// query validateTimeStamp from blockchain and return to the client
export async function batchVerifyTimestamp(
  batchData: any,
  provider: string,
  scAddress: string,
): Promise<string[]> {
  const scInstance = loadSmartContract(provider, scAddress);
  const data = await scInstance?.methods
    .batchVerifyTimestamps(batchData)
    .call();

  return data.map((ele) => (ele ? 'Y' : 'N'));
}

// get data from blockchain and return to the client
export async function batchVerifyHeader(
  batchHashID: string[],
  provider: string,
  scAddress: string,
): Promise<string[]> {
  const scInstance = loadSmartContract(provider, scAddress);

  const data = await scInstance?.methods.batchVerifyHeader(batchHashID).call();
  return data.map((ele) => (ele ? 'Y' : 'N'));
}

export async function getListEOSHeader(
  id: number,
  provider: string,
  scAddress: string,
): Promise<any> {
  const scInstance = loadSmartContract(provider, scAddress);
  const res = [];
  const listHash: string[] = await scInstance?.methods
    .getListTxnHeaderHashById(id)
    .call();
  // const ret = await scInstance?.methods.getListEOSHeader(id).call();
  for (let i = 0; i < listHash.length; i++) {
    const hashID = listHash[i];
    const ret = await scInstance?.methods.txnHeaderInformation(hashID).call();
    const startISOString = new Date(+ret.p1.startOfTransaction).toISOString();
    const endISOString = new Date(+ret.p1.endOfTransaction).toISOString();
    //format data after get item from blockchain
    const tmp = {
      EOSID: +ret.p1.eosId,
      StartOfTransaction: convertToCustomISO8601(startISOString),
      EndOfTransaction: convertToCustomISO8601(endISOString),
      IMONumber: ret.p1.imoNumber,
      ArrivalID: ret.p1.arrivalID,
      VesselName: ret.p1.vesselName,
      Jetty: ret.p1.jetty,
      TerminalNumber: ret.p1.terminalNumber,
      TerminalName: ret.p1.terminalName,
      TraderName: ret.p1.traderName,
      Agent: ret.p1.agent,
      Status: ret.p1.status,
      BerthingPilotageID: ret.p1.berthingPilotageID,
      VesselSize: ret.p1.vesselSize,

      PilotageLocationFrom1: ret.p2.pilotageLocationFrom1,
      PilotageLocationTo1: ret.p2.pilotageLocationTo1,
      ArrivalStatus: ret.p2.arrivalStatus,
      UnberthingPilotageID: ret.p2.unberthingPilotageID,
      PilotageLocationFrom2: ret.p2.pilotageLocationFrom2,
      PilotageLocationTo2: ret.p2.pilotageLocationTo2,
      HashID: hashID,
    };
    res.push(tmp);
  }
  return res;
}

/**
 * The function `getListEOS` retrieves a list of data from a smart contract based on the provided ID,
 * provider, and smart contract address.
 * @param {number} id - The `id` parameter is a number that represents the EOS ID. It is used to
 * retrieve information related to a specific EOS ID from the smart contract.
 * @param {string} provider - The `provider` parameter is a string that represents the provider or
 * network URL for the blockchain. It is used to connect to the blockchain network and interact with
 * the smart contract.
 * @param {string} scAddress - The `scAddress` parameter is the address of the smart contract on the
 * blockchain that you want to interact with.
 * @returns a Promise that resolves to an array of objects of type `QueryBCRes`.
 */
export async function getListEOS(
  id: number,
  provider: string,
  scAddress: string,
): Promise<QueryBCRes[]> {
  const scInstance = loadSmartContract(provider, scAddress);
  const items = await scInstance?.methods.getListTimestampByEOSID(id).call();
  const meta = items.meta;
  const info = items.info;
  const res: QueryBCRes[] = [];
  for (const item of meta) {
    for (let i = 0; i < maxEOSMetaLen; i++) {
      const eventKey = `eventSubStage${i + 1}`;
      const timestampKey = `timestamp${i + 1}`;

      if (Number(item[eventKey]) !== 0) {
        let infoItemData;
        for (const infoItem of info) {
          for (let j = 0; j < maxEOSRecordLen; j++) {
            const itemSymbol = `e${j + 1}`;
            if (
              Number(infoItem[itemSymbol][`eventSubStage`]) !==
              Number(item[eventKey])
            )
              continue;

            infoItemData = infoItem[itemSymbol];
          }
        }

        res.push(({
          EOSID: id,
          EventSubStage: +item[eventKey],
          Timestamp: convertToCustomISO8601(
            new Date(+item[timestampKey]).toISOString(),
          ),
          Field1: infoItemData ? infoItemData.field1 : 0,
          Field2: infoItemData ? infoItemData.field2 : 0,
          Field3: infoItemData ? infoItemData.field3 : 0,
          Field4: infoItemData ? infoItemData.field4 : 0,
          Field5: infoItemData
            ? decodeHexStringToString(infoItemData.field5)
            : '',
          Field6: infoItemData
            ? decodeHexStringToString(infoItemData.field6)
            : '',
          Field7: infoItemData
            ? decodeHexStringToString(infoItemData.field7)
            : '',
          Field8: infoItemData
            ? decodeHexStringToString(infoItemData.field8)
            : '',
          Field9: infoItemData
            ? decodeHexStringToString(infoItemData.field9)
            : '',
        } as unknown) as QueryBCRes);
      }
    }
  }

  return res;
}

/**
 * The function `getTimestamp` retrieves a timestamp from a smart contract using the provided hash ID,
 * provider, and smart contract address.
 * @param {string} hashID - A string representing the ID of the hash for which you want to retrieve the
 * timestamp.
 * @param {string} provider - The `provider` parameter is a string that represents the Ethereum network
 * provider. It could be the URL of an Ethereum node or a provider object from a library like Web3.js
 * or ethers.js. This is used to connect to the Ethereum network and interact with smart contracts.
 * @param {string} scAddress - The `scAddress` parameter is the address of the smart contract on the
 * blockchain. It is a string that represents the unique identifier of the smart contract.
 * @returns a Promise that resolves to a string value.
 */
export async function getTimestamp(
  hashID: string,
  provider: string,
  scAddress: string,
): Promise<string> {
  const scInstance = loadSmartContract(provider, scAddress);

  return scInstance?.methods.getTimestamp(hashID).call();
}

/**
 * The function `batchGetTimestamp` is a TypeScript function that takes an array of batchHashIDs, a
 * provider string, and a smart contract address string as parameters, and returns a Promise that
 * resolves to an array of strings.
 * @param {string[]} batchHashID - An array of string values representing the batch hash IDs for which
 * you want to retrieve timestamps.
 * @param {string} provider - The `provider` parameter is a string that represents the Ethereum network
 * provider. It could be the URL of an Ethereum node or the name of a supported provider such as
 * "mainnet" or "ropsten".
 * @param {string} scAddress - The `scAddress` parameter is the address of the smart contract on the
 * blockchain. It is a string that represents the unique identifier of the smart contract.
 * @returns a Promise that resolves to an array of strings.
 */
export async function batchGetTimestamp(
  batchHashID: string[],
  provider: string,
  scAddress: string,
): Promise<string[]> {
  const scInstance = loadSmartContract(provider, scAddress);

  const data = await scInstance?.methods.batchGetTimestamp(batchHashID).call();

  return data;
}

export async function storeTimestampsPayload(
  hashID: string,
  unixTime: number,
): Promise<string> {
  const scInstance = loadSmartContract();

  const txData = scInstance?.methods
    .storeTimestamps(hashID, new BN(unixTime))
    .encodeABI();
  return txData;
}

/**
 * The function estimates the gas required to execute the storeTimestamps method of a smart contract.
 * @param {string} hashID - A string representing the ID of the hash.
 * @param {number} unixTime - The `unixTime` parameter represents the timestamp in Unix time format.
 * Unix time is a system for describing points in time as the number of seconds that have elapsed since
 * January 1, 1970, at 00:00:00 UTC. It is commonly used in computer systems and programming languages
 * @param {string} scAddress - The `scAddress` parameter is the address of the smart contract on the
 * blockchain. It is a string that represents the Ethereum address of the smart contract.
 * @param {string} sender - The `sender` parameter represents the address of the account that will be
 * sending the transaction to store the timestamps.
 * @param {string} provider - The `provider` parameter is the URL or endpoint of the Ethereum node that
 * you want to connect to. It could be a local node running on your machine or a remote node provided
 * by a service like Infura.
 * @returns a Promise that resolves to a number, which represents the estimated gas required to execute
 * the `storeTimestamps` method of the smart contract.
 */
export async function estimateGasForStoreTimestampsPayload(
  hashID: string,
  unixTime: number,
  scAddress: string,
  sender: string,
  provider: string,
): Promise<number> {
  const scInstance = loadSmartContract(provider, scAddress);

  const estimatedGas = await scInstance?.methods
    .storeTimestamps(hashID, new BN(unixTime))
    .estimateGas({
      from: sender,
    });
  return estimatedGas;
}

/**
 * The function `batchStoreTimestampsPayload` takes a DTO object containing data and metadata,
 * processes the data, and returns the encoded ABI data for a smart contract method call.
 * @param {SaveDataTimestampsDTO} batchStoreTimestampsDTO - The `batchStoreTimestampsDTO` parameter is
 * an object that contains two properties: `data` and `metaData`.
 * @returns a Promise that resolves to a string.
 */
export async function batchStoreTimestampsPayload(
  batchStoreTimestampsDTO: SaveDataTimestampsDTO,
): Promise<string> {
  const scInstance = loadSmartContract();

  const EOSIDs = batchStoreTimestampsDTO.data.map((ele) => {
    return ele.EOSID;
  });

  const infoArr = batchStoreTimestampsDTO.data.map((ele) => {
    delete ele.info['0'];
    return ele.info;
  });

  const metaEOSIDs = batchStoreTimestampsDTO.metaData.map((ele) => {
    return ele.EOSID;
  });

  const metaInfoArr = batchStoreTimestampsDTO.metaData.map((ele) => {
    delete ele.info['0'];
    return ele.info;
  });

  try {
    scInstance?.methods
      .addEventSubStageTimestamps(metaEOSIDs, EOSIDs, metaInfoArr, infoArr)
      .encodeABI();
  } catch (e) {
    console.log(e);
  }
  const txData = scInstance?.methods
    .addEventSubStageTimestamps(metaEOSIDs, EOSIDs, metaInfoArr, infoArr)
    .encodeABI();
    console.log(`add events massage ==> ${metaEOSIDs},${EOSIDs}, ${metaInfoArr}, ${infoArr}`);
  return txData;
}


/**
 * The function `batchHeaderPayload` takes an array of data, extracts hashIDs from each element, and
 * encodes the data into a transaction payload for a smart contract method call.
 * @param {any} data - The `data` parameter is an array of objects. Each object in the array represents
 * a data element and has the following properties:
 * @returns the encoded ABI data for a transaction that calls the `batchStoreHeader` method of a smart
 * contract.
 */
export async function batchHeaderPayload(data: any): Promise<string> {
  const scInstance = loadSmartContract();

  const hashArr = data.map((ele) => {
    return ele.p1.hashID;
  });

  const headerData = data.map((ele) => {
    return ele;
  });

  const txData = scInstance?.methods
    .batchStoreHeader(hashArr, headerData)
    .encodeABI();
  return txData;
}

/**
 * This TypeScript function estimates the gas required to execute a method on a smart contract.
 * @param {SaveDataTimestampsDTO} batchStoreTimestampsDTO - The `batchStoreTimestampsDTO` parameter is
 * an object that contains two properties: `data` and `metaData`.
 * @param {string} scAddress - The `scAddress` parameter is the address of the smart contract on the
 * blockchain. It is a string that represents the Ethereum address of the smart contract.
 * @param {string} sender - The `sender` parameter is the address of the account that will be sending
 * the transaction to the smart contract.
 * @param {string} provider - The `provider` parameter is a string that represents the Ethereum
 * provider URL. It is used to connect to the Ethereum network and interact with the smart contract.
 * @returns a Promise that resolves to a string.
 */

export async function estimatedGasForBatchStoreTimestampsPayload(
  batchStoreTimestampsDTO: SaveDataTimestampsDTO,
  scAddress: string,
  sender: string,
  provider: string,
): Promise<string> {
  const scInstance = loadSmartContract(provider, scAddress);

  const EOSIDs = batchStoreTimestampsDTO.data.map((ele) => {
    return ele.EOSID;
  });

  const infoArr = batchStoreTimestampsDTO.data.map((ele) => {
    delete ele.info['0'];
    return ele.info;
  });

  const metaEOSIDs = batchStoreTimestampsDTO.metaData.map((ele) => {
    return ele.EOSID;
  });

  const metaInfoArr = batchStoreTimestampsDTO.metaData.map((ele) => {
    delete ele.info['0'];
    return ele.info;
  });

   console.log("Payload going to addEventSubStageTimestamps:");
     console.log(` 
     metaEOSIDs: ${JSON.stringify(metaEOSIDs)}, 
     EOSIDs: ${JSON.stringify(EOSIDs)}, 
     metaInfoArr: ${JSON.stringify(metaInfoArr)}, 
     infoArr: ${JSON.stringify(infoArr)}`
  );

  return scInstance?.methods
    .addEventSubStageTimestamps(metaEOSIDs, EOSIDs, metaInfoArr, infoArr)
    .estimateGas({
      from: sender,
    });
}


/**
 * The function `estimatedGasForBatchHeaderPayload` calculates the estimated gas required to execute a
 * batchStoreHeader function call on a smart contract.
 * @param {any} header - The `header` parameter is an array of objects. Each object represents a header
 * and contains properties such as `p1` and `hashID`.
 * @param {string} scAddress - The `scAddress` parameter is the address of the smart contract you want
 * to interact with.
 * @param {string} sender - The `sender` parameter is the address of the account that will be sending
 * the transaction to the smart contract.
 * @param {string} provider - The `provider` parameter is a string that represents the Ethereum
 * provider URL. It is used to connect to the Ethereum network and interact with the smart contract.
 * @returns a Promise that resolves to a string.
 */
export async function estimatedGasForBatchHeaderPayload(
  header: any,
  scAddress: string,
  sender: string,
  provider: string,
): Promise<string> {
  const scInstance = loadSmartContract(provider, scAddress);

  // get list hashIds from header
  const hashArr = header.map((ele) => {
    return ele.p1.hashID;
  });

  // get list header details from header
  const headerData = header.map((ele) => {
    delete ele.hashID;
    return ele;
  });

  return scInstance?.methods
    .batchStoreHeader(hashArr, headerData)
    .estimateGas({
      from: sender,
    });
}

export function ISO8601ToTimestamp(date: string): number {
  return new Date(date).getTime();
}

export function isIsoDate(str: string) {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
  const d = new Date(str);
  return d instanceof Date && !isNaN(d.getTime()) && d.toISOString() === str; // valid date
}

// export function validateISO8601DateTime(dateTimeString: string): boolean {
//   const pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?([+-]\d{2}:\d{2}|Z)$/;

//   return pattern.test(dateTimeString);
// }

export function validateISO8601DateTime(dateTimeString: string): boolean {
  const pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;

  if (pattern.test(dateTimeString)) {
    return true;
  } else {
    return false;
  }
}

export function haveDuplicateEntry(arry: any[]) {
  const uniqueElements = new Set(arry);
  return Array.from(uniqueElements).length < arry.length;
}

function convertToCustomISO8601(isoString) {
  const localString = new Date(isoString).toLocaleString('en-US', {
    timeZone: 'Asia/Singapore',
    hour12: false,
  });
  const [date, time] = localString.split(',');
  // eslint-disable-next-line prefer-const
  let [month, day, year] = date.split('/');
  if (month.length === 1) month = '0' + month;
  if (day.length === 1) day = '0' + day;

  const offsetMinutes = -480; // +08:00
  const offsetSign = offsetMinutes > 0 ? '-' : '+';
  const absOffsetMinutes = Math.abs(offsetMinutes);
  const offsetHours = Math.floor(absOffsetMinutes / 60);
  const offsetMinutesRemainder = absOffsetMinutes % 60;

  const convertedString =
    year +
    '-' +
    month +
    '-' +
    day +
    'T' +
    time.trim() +
    offsetSign +
    offsetHours.toString().padStart(2, '0') +
    ':' +
    offsetMinutesRemainder.toString().padStart(2, '0');

  return convertedString;
}

export function decreaseStringSizeTo(data: string, to: number) {
  if (data.length <= to) return data;
  return data.slice(0, to);
}

export function encodeStringToHex(input: string, bytesSize = 16) {
  const maxLength = bytesSize * 2; // Each byte requires two characters in hexadecimal representation
  const utf8Encoded = new TextEncoder().encode(input);
  const hexString = Array.from(utf8Encoded)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  if (hexString.length > maxLength) {
    return hexString.slice(0, maxLength);
  }

  return '0x' + hexString.padEnd(maxLength, '0');
}

export function decodeHexStringToString(code: string) {
  const decoder = new TextDecoder();
  const data = new Uint8Array(
    code.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)),
  );
  const res = decoder.decode(data);
  return res.replace(/\u0000/g, '');
  // return res.replaceAll('\u0000', '');
}
