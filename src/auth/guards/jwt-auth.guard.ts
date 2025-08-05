// filepath: /Users/blxckbxll/Documents/Proyectos/beyond/src/auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    console.log('🛡️ Guard - Error:', err);
    console.log('🛡️ Guard - User:', user);
    console.log('🛡️ Guard - Info:', info);
    
    if (err || !user) {
      console.log('❌ Guard rechazó la request');
      throw err || new UnauthorizedException('Token inválido o usuario no encontrado');
    }
    
    console.log('✅ Guard aceptó la request');
    return user;
  }
}