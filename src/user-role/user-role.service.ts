import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UserRole } from './entities/user-role.entity';

@Injectable()
export class UserRoleService {
  constructor(
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  create(createUserRoleDto: CreateUserRoleDto) {
    return 'This action adds a new userRole';
  }

  findAll() {
    return `This action returns all userRole`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userRole`;
  }

  update(id: number, updateUserRoleDto: UpdateUserRoleDto) {
    return `This action updates a #${id} userRole`;
  }

  remove(id: number) {
    return `This action removes a #${id} userRole`;
  }
}
