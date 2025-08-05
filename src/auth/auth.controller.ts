import { Controller, Post, Body, Get, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtService } from '@nestjs/jwt';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado correctamente' })
  @ApiResponse({ status: 409, description: 'El usuario o email ya existe' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getProfile(@CurrentUser() user: any) {
    console.log('👤 Usuario del request:', user);
    // Obtener los datos completos del usuario desde la base de datos
    const fullUser = await this.authService.findUserById(user.id);
    return {
      success: true,
      data: fullUser
    };
  }

  // Endpoint temporal para debug
  @Post('debug-token')
  @ApiOperation({ summary: 'Debug de token JWT' })
  debugToken(@Body() body: { token?: string }, @Headers('authorization') authHeader?: string) {
    try {
      // Intentar obtener el token del body o del header
      let token = body.token;
      
      if (!token && authHeader) {
        token = authHeader.replace('Bearer ', '');
      }
      
      if (!token) {
        return {
          success: false,
          error: 'No se proporcionó token',
          message: 'Token requerido en body.token o Authorization header'
        };
      }

      console.log('🔍 Token recibido:', token.substring(0, 50) + '...');
      const decoded = this.jwtService.verify(token);
      
      return {
        success: true,
        decoded: decoded,
        message: 'Token válido',
        tokenPreview: token.substring(0, 50) + '...'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Token inválido'
      };
    }
  }

  // Endpoint adicional para verificar el estado del servidor
  @Get('status')
  @ApiOperation({ summary: 'Estado del servidor de autenticación' })
  getStatus() {
    return {
      success: true,
      message: 'Servidor de autenticación funcionando',
      timestamp: new Date().toISOString(),
      jwtSecret: process.env.JWT_SECRET ? 'Configurado' : 'No configurado'
    };
  }
}