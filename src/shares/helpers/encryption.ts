import Cryptr from 'cryptr';
import * as dotenv from 'dotenv';
dotenv.config();

const cryptr = new Cryptr(process.env.ENCRYPTED_PRIVATE_KEY_SECRET || 'secret');

export function encrypt(data: string): string {
  return cryptr.encrypt(data);
}

export function decrypt(data: string): string {
  return cryptr.decrypt(data);
}

export function getPrivateKey(): string {
  return cryptr.decrypt(process.env.ENCRYPTED_PRIVATE_KEY_HEX);
}

export function getDBPassword(): string {
  return cryptr.decrypt(process.env.ENCRYPTED_DBPASS_HEX);
}