import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/user/entities/user.entity';
import { Request as ReqExpress } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passReqToCallback: true,
    });
  }

  async validate(@Request() req: ReqExpress): Promise<User> {
    const user = await this.authService.validateUser(
      req.body.email,
      req.body.password,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
