import * as bcrypt from 'bcrypt';

export async function hashPassword(plainPassword: string) {
  return bcrypt.hash(plainPassword, 10);
}
