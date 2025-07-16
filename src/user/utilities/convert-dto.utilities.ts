import { UpdateUserDTO } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { CreateUserDTO } from '../dto/create-user.dto';
import { hashPassword } from './hash-pasword.utilities';

export async function convertDtoToUser(userDto: CreateUserDTO): Promise<User> {
  const user = new User();
  user.name = userDto.name;
  user.password = await hashPassword(userDto.password);
  user.email = userDto.email;
  return user;
}
