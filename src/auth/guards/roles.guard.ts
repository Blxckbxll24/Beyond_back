import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    // Verificar si el usuario tiene userType que coincida con los roles requeridos
    if (user.userType && requiredRoles.includes(user.userType)) {
      return true;
    }
    
    // Verificar si el usuario tiene roles específicos (si usas el sistema de roles separado)
    if (user.roles && Array.isArray(user.roles)) {
      return requiredRoles.some((role) => user.roles.includes(role));
    }
    
    return false;
  }
}