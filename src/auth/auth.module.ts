import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from './constants';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { UserModule } from 'src/user/user.module';
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      // signOptions: { expiresIn: '60s' },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
