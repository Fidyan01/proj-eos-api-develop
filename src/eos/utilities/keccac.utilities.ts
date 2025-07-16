import * as utils from 'web3-utils';

export function hashData(params: string[]): string {
  return utils.keccak256(utils.encodePacked(...params));
}
