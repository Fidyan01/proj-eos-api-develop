import { BigNumber } from 'bignumber.js';
import crypto from 'crypto';

BigNumber.config({ EXPONENTIAL_AT: -256 });

export const getVariableName = <TResult>(getVar: () => TResult): string => {
  const m = /\(\)=>(.*)/.exec(
    getVar.toString().replace(/(\r\n|\n|\r|\s)/gm, ''),
  );

  if (!m) {
    throw new Error(
      "The function does not contain a statement matching 'return variableName;'",
    );
  }

  const fullMemberName = m[1];

  const memberParts = fullMemberName.split('.');

  return memberParts[memberParts.length - 1];
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const objectToParamQuery = (data: Record<string, any>) =>
  Object.keys(data)
    .map((key) => key + '=' + data[key])
    .join('&');

export const toLower = (value: string) => {
  if (value === null || value === undefined) return '';
  return value.toLowerCase();
};

export const randomHex = (length: number) =>
  crypto.randomBytes(length).toString('hex');

export const nullToZero = (value: string | number) =>
  value ? value.toString() : '0';

export const calculateRoi = (data: { balance: number }[]) => {
  const oldestBalance = data[0]?.balance ?? 0;
  const latestBalance = data[data.length - 1]?.balance ?? 0;

  if (!oldestBalance && !latestBalance) return 0;

  if (oldestBalance === 0 && latestBalance > 0) return 100;

  return ((latestBalance - oldestBalance) / oldestBalance) * 100;
};
