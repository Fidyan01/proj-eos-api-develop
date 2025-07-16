import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, plainPassword: string): Promise<User> {
    const user = await this.userService.findByEmail(email.toLowerCase());
    if (!user || !user.id) {
      return null;
    }

    const checkPass = await this.userService.compareHashedPassword(
      plainPassword,
      user.password,
    );
    if (!checkPass) {
      return null;
    }
    delete user.password;
    return user;
  }

  async login(user: User) {
    const expTime = Date.now() + +process.env.ACCESS_TOKEN_EXPIRE;
    const payload = { email: user.email, sub: user.id, ttl: expTime };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
