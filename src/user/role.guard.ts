import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { includes } from 'lodash';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requireRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    const roles = JSON.parse(user.roles);

    return requireRoles.some((role) => includes(roles, role));
  }
}
