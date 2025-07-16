import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    // TODO: validate logged out

    const expTime = payload.ttl || 0;

    const now = Date.now();
    if (now > expTime) {
      throw new Error('Token has expired');
    }

    const user = await this.userService.findByEmail(payload.email);

    return { userId: user.id, email: user.email };
  }
}
