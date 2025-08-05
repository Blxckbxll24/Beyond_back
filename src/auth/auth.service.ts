import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: registerDto.email },
          { username: registerDto.username }
        ]
      });

      if (existingUser) {
        throw new HttpException(
          'El usuario o email ya existe',
          HttpStatus.CONFLICT
        );
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // 👈 CORREGIDO: Buscar el rol por defecto según el tipo de usuario
      let defaultRole: Role | null = null;
      if (registerDto.userType) {
        defaultRole = await this.roleRepository.findOne({
          where: { name: registerDto.userType }
        });
      }

      const user = this.userRepository.create({
        ...registerDto,
        password: hashedPassword,
        roles: defaultRole ? [defaultRole] : [], // 👈 CORREGIDO: usar defaultRole
        qrCode: uuidv4(), // Generar QR al crear usuario
        qrActive: true
      });

      await this.userRepository.save(user);

      // Generar token
      const payload = { 
        sub: user.id, 
        username: user.username, 
        userType: user.userType,
        email: user.email,
        roles: user.roles?.map(role => role.name) || []
      };
      const access_token = this.jwtService.sign(payload);

      return {
        success: true,
        message: 'Usuario registrado correctamente',
        data: {
          user: { ...user, password: undefined },
          access_token
        }
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error al registrar usuario: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: loginDto.email },
        relations: ['roles']
      });

      if (!user) {
        throw new HttpException(
          'Credenciales inválidas',
          HttpStatus.UNAUTHORIZED
        );
      }

      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

      if (!isPasswordValid) {
        throw new HttpException(
          'Credenciales inválidas',
          HttpStatus.UNAUTHORIZED
        );
      }

      if (!user.isActive) {
        throw new HttpException(
          'Usuario inactivo',
          HttpStatus.FORBIDDEN
        );
      }

      const payload = { 
        sub: user.id, 
        username: user.username, 
        userType: user.userType,
        email: user.email,
        roles: user.roles?.map(role => role.name) || []
      };
      
      const access_token = this.jwtService.sign(payload);

      return {
        success: true,
        message: 'Login exitoso',
        data: {
          user: { ...user, password: undefined },
          access_token
        }
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Error al iniciar sesión: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findUserById(userId: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, isActive: true },
        relations: ['roles']
      });

      if (!user) {
        throw new HttpException(
          'Usuario no encontrado',
          HttpStatus.NOT_FOUND
        );
      }

      return { ...user, password: undefined };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Error al buscar usuario',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}