import { forwardRef, Global, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRoleModule } from 'src/user-role/user-role.module';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => UserRoleModule)],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule],
  providers: [UserService],
})
export class UserModule {}
