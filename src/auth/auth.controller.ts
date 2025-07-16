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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { LoginDTO } from './dto/login.dto';
import { EncryptPrivateKeyDTO } from 'src/auth/dto/auth.dto';
import { encrypt } from 'src/shares/helpers/encryption';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({ type: LoginDTO })
  async login(@Request() req: LoginDTO): Promise<any> {
    return this.authService.login((req as any).user);
  }

  @Post('encrypt')
  @ApiBody({ type: EncryptPrivateKeyDTO })
  async encryptPrivateKey(@Body() req: EncryptPrivateKeyDTO): Promise<string> {
    return encrypt(req.privateKey);
  }
}
