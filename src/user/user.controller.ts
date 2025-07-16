import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Put,
  Query,
} from '@nestjs/common';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ListResult } from 'src/shares/interfaces/list-result.interface';
import { request } from 'http';
import { UpdateUserMeDTO } from './dto/update-user-me.dto';
import { ChangePasswordDTO } from './dto/change-password.dto';

@Controller('user')
@ApiTags('User')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req): Promise<any> {
    return this.userService.me(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() createUserDTO: CreateUserDTO): Promise<any> {
    // return this.userService.create(createUserDTO);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-me')
  async updateMe(
    @Request() req,
    @Body() updateUserMeDTO: UpdateUserMeDTO,
  ): Promise<User> {
    return this.userService.updateMe(req.user.userId, updateUserMeDTO);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update/:id')
  async update(
    @Param('id') id: number,
    @Body() updateUserDTO: UpdateUserDTO,
  ): Promise<any> {
    // return this.userService.update(id, updateUserDTO);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @Request() req,
    @Body() changePasswordDTO: ChangePasswordDTO,
  ): Promise<User> {
    return this.userService.changePassword(req.user.userId, changePasswordDTO);
  }
}
