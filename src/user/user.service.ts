import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  HttpStatus,
  Inject,
  forwardRef,
  HttpException,
} from '@nestjs/common';
import { httpErrors } from 'src/shares/exception';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { contains } from 'class-validator';
import { CreateUserDTO } from './dto/create-user.dto';
import { convertDtoToUser } from './utilities/convert-dto.utilities';
import { hashPassword } from './utilities/hash-pasword.utilities';
import { UpdateUserDTO } from './dto/update-user.dto';
import { ListResult } from 'src/shares/interfaces/list-result.interface';
import { pagination } from 'src/shares/helpers/pagination';
import { UserRole } from 'src/user-role/entities/user-role.entity';
import { UserRoleService } from 'src/user-role/user-role.service';
import { UpdateUserMeDTO } from './dto/update-user-me.dto';
import { ChangePasswordDTO } from './dto/change-password.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly userRoleService: UserRoleService,
  ) {}

  async me(id: number): Promise<any> {
    const queryBuilder = await this.userRepository.createQueryBuilder('users');
    queryBuilder.leftJoin('roles', 'user_role', 'user_role.id = users.roles');
    queryBuilder.addSelect(['user_role.name as users_role_name']);
    queryBuilder.where('users.id = :id', { id });
    const res = await queryBuilder.getRawOne();
    delete res.users_password;
    return res;
  }

  async findAll(listUserDto: any): Promise<ListResult<User>> {
    try {
      const queryBuilder = await this.userRepository.createQueryBuilder(
        'users',
      );
      if (listUserDto) {
        if (listUserDto.filterStatus)
          queryBuilder.andWhere('users.status = :status', {
            status: listUserDto.filterStatus,
          });
        if (listUserDto.filterType)
          queryBuilder.andWhere('users.type = :type', {
            type: listUserDto.filterType,
          });
        if (listUserDto.sortType)
          queryBuilder.addOrderBy('users.createdAt', listUserDto.sortType);
        const [page, limit] = pagination(listUserDto.page, listUserDto.size);
        queryBuilder.offset((page - 1) * limit).limit(limit);
      }
      const [result, total] = await queryBuilder.getManyAndCount();
      return {
        result,
        total,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async compareHashedPassword(plain: string, hashed: string) {
    return bcrypt.compare(plain, hashed);
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userRepository
      .createQueryBuilder()
      .where('LOWER(email) = LOWER(:email)', {
        email: email,
      })
      .getOne();
  }

  // @Transaction()
  // async create(
  //   createUserDto: CreateUserDTO,
  //   @TransactionRepository(UserRole)
  //   userRoleRepositoryTrans?: Repository<UserRole>,
  //   @TransactionRepository(User) userRepositoryTrans?: Repository<User>,
  // ): Promise<User> {
  //   try {
  //     const existedEmail = await this.findByEmail(createUserDto.email);
  //     if (existedEmail)
  //       throw new HttpException(
  //         httpErrors.EMAIL_EXSITED,
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     if (contains(createUserDto.password, ' '))
  //       throw new HttpException(
  //         httpErrors.PASSWORD_HAS_SPACE,
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     const newUser = await userRepositoryTrans.save({
  //       name: createUserDto.name,
  //       password: await hashPassword(createUserDto.password),
  //       email: createUserDto.email,
  //     });
  //     // insert user role
  //     for (const roleId of createUserDto.roleIds) {
  //       const role = await this.roleService.findOne(roleId);
  //       if (!role)
  //         throw new HttpException(
  //           httpErrors.ROLE_IS_NOT_EXSITED,
  //           HttpStatus.NOT_FOUND,
  //         );
  //       await userRoleRepositoryTrans.save({
  //         name: `USER${newUser.id}-ROLE${roleId}`,
  //         code: `USER${newUser.id}-ROLE${roleId}`,
  //         roleId: roleId,
  //         userId: newUser.id,
  //       });
  //     }

  //     await this.metaRepository.save({
  //       key: 'mode_' + newUser.id,
  //       value: JSON.stringify('{"status":"AVAILABLE","program":"AUTO"}'),
  //       userId: newUser.id,
  //     });

  //     return newUser;
  //   } catch (error) {
  //     throw new BadRequestException(error);
  //   }
  // }

  // @Transaction()
  // async update(
  //   id,
  //   updateUserDTO: UpdateUserDTO,
  //   @TransactionRepository(UserRole)
  //   userRoleRepositoryTrans?: Repository<UserRole>,
  //   @TransactionRepository(User) userRepositoryTrans?: Repository<User>,
  // ): Promise<User> {
  //   if (contains(updateUserDTO.password, ' '))
  //     throw new HttpException(
  //       httpErrors.PASSWORD_HAS_SPACE,
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   const user = await this.userRepository.findOne(id);
  //   user.password = await hashPassword(updateUserDTO.password);
  //   user.name = updateUserDTO.name;
  //   const userRoles = await this.userRoleService.findByUserId(id);
  //   // check insert user roles
  //   for (const roleId of updateUserDTO.roleIds) {
  //     const role = await this.roleService.findOne(roleId);
  //     if (!role)
  //       throw new HttpException(
  //         httpErrors.ROLE_IS_NOT_EXSITED,
  //         HttpStatus.NOT_FOUND,
  //       );
  //     let isCreateRole = true;
  //     for (const userRole of userRoles) {
  //       if (role.id === userRole.roleId) {
  //         isCreateRole = false;
  //       }
  //     }
  //     if (isCreateRole) {
  //       await userRoleRepositoryTrans.save({
  //         name: `USER${user.id}-ROLE${roleId}`,
  //         code: `USER${user.id}-ROLE${roleId}`,
  //         roleId: roleId,
  //         userId: user.id,
  //       });
  //     }
  //   }
  //   // check delete user
  //   for (const userRole of userRoles) {
  //     let isDeleteRole = true;
  //     if (updateUserDTO.roleIds.includes(userRole.roleId)) isDeleteRole = false;
  //     if (isDeleteRole) {
  //       await userRoleRepositoryTrans.delete(userRole.id);
  //     }
  //   }
  //   return await userRepositoryTrans.save(user);
  // }

  async updateMe(id, updateUserMeDTO: UpdateUserMeDTO): Promise<User> {
    if (contains(updateUserMeDTO.password, ' '))
      throw new HttpException(
        httpErrors.PASSWORD_HAS_SPACE,
        HttpStatus.BAD_REQUEST,
      );
    const user = await this.userRepository.findOne(id);
    user.password = await hashPassword(updateUserMeDTO.password);
    user.name = updateUserMeDTO.name;
    return await this.userRepository.save(user);
  }

  async changePassword(
    id,
    changePasswordDTO: ChangePasswordDTO,
  ): Promise<User> {
    if (contains(changePasswordDTO.newPassword, ' '))
      throw new HttpException(
        httpErrors.PASSWORD_HAS_SPACE,
        HttpStatus.BAD_REQUEST,
      );
    const user = await this.userRepository.findOne(id);
    const compareHashedPassword = await this.compareHashedPassword(
      changePasswordDTO.oldPassword,
      user.password,
    );
    if (!compareHashedPassword) {
      throw new HttpException(httpErrors.WRONG_PASSWORD, HttpStatus.CONFLICT);
    }
    user.password = await hashPassword(changePasswordDTO.newPassword);
    return await this.userRepository.save(user);
  }
}
