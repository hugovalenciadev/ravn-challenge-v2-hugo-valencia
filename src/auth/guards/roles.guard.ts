import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import RoleEnum from 'src/users/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<RoleEnum[]>(ROLES_KEY, context.getHandler());

    if (!roles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    // match roles
    return roles.some((role) => user?.roles?.includes(role));
  }
}
