
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET', 'beyond-secret-key-2024');
    console.log('🔐 JWT Secret in strategy:', secret);
    
    super({
      // ✅ MEJORAR: Múltiples formas de extraer el token
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromBodyField('token'),
        // Fallback personalizado
        (request) => {
          console.log('🔍 Headers recibidos:', request.headers);
          
          // Buscar en Authorization header
          if (request.headers && request.headers.authorization) {
            const authHeader = request.headers.authorization;
            console.log('🔑 Authorization header:', authHeader);
            
            if (authHeader.startsWith('Bearer ')) {
              const token = authHeader.substring(7);
              console.log('✅ Token extraído:', token.substring(0, 20) + '...');
              return token;
            }
          }
          
          console.log('❌ No se pudo extraer token');
          return null;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    console.log('🔍 JWT Payload validado:', {
      sub: payload.sub,
      username: payload.username,
      userType: payload.userType,
      roles: payload.roles
    });
    
    const user = { 
      id: payload.sub, 
      username: payload.username, 
      email: payload.email,
      userType: payload.userType,
      roles: payload.roles || []
    };

    console.log('✅ Usuario validado:', user);
    return user;
  }
}