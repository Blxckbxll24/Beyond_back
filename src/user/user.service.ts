import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User, UserType } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: createUserDto.email },
          { username: createUserDto.username }
        ]
      });

      if (existingUser) {
        throw new HttpException(
          'El usuario o email ya existe',
          HttpStatus.CONFLICT
        );
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword
      });

      // Asignar rol por defecto según el tipo de usuario
      if (createUserDto.userType) {
        const defaultRole = await this.roleRepository.findOne({
          where: { name: createUserDto.userType }
        });
        
        if (defaultRole) {
          user.roles = [defaultRole];
        }
      }

      await this.userRepository.save(user);
      
      return {
        success: true,
        message: 'Usuario creado correctamente',
        data: { ...user, password: undefined }
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al crear el usuario: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async findAll() {
    try {
      const users = await this.userRepository.find({
        relations: ['roles'],
        select: ['id', 'username', 'email', 'firstName', 'lastName', 'phone', 'userType', 'isActive', 'createdAt']
      });
      
      return {
        success: true,
        data: users,
        count: users.length
      };
    } catch (error) {
      throw new HttpException(
        `Error al obtener los usuarios: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['roles'],
        select: ['id', 'username', 'email', 'firstName', 'lastName', 'phone', 'userType', 'isActive', 'createdAt']
      });

      if (!user) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al obtener el usuario: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['roles']
      });
      
      if (!user) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }

      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      await this.userRepository.update(id, updateUserDto);
      const updatedUser = await this.userRepository.findOne({
        where: { id },
        relations: ['roles'],
        select: ['id', 'username', 'email', 'firstName', 'lastName', 'phone', 'userType', 'isActive']
      });

      return {
        success: true,
        message: 'Usuario actualizado correctamente',
        data: updatedUser
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al actualizar el usuario: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async remove(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      
      if (!user) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }

      await this.userRepository.update(id, { isActive: false });

      return {
        success: true,
        message: 'Usuario desactivado correctamente'
      };
    } catch (error) {
      throw new HttpException(
        `Error al eliminar el usuario: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // Métodos para gestión de roles
  async assignRoles(userId: number, roleIds: number[]) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['roles']
      });

      if (!user) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }

      const roles = await this.roleRepository.find({
        where: { id: In(roleIds), isActive: true }
      });

      if (roles.length !== roleIds.length) {
        throw new HttpException('Algunos roles no fueron encontrados', HttpStatus.BAD_REQUEST);
      }

      user.roles = roles;
      await this.userRepository.save(user);

      return {
        success: true,
        message: 'Roles asignados correctamente',
        data: { ...user, password: undefined }
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al asignar roles: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async removeRoles(userId: number, roleIds: number[]) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['roles']
      });

      if (!user) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }

      user.roles = user.roles.filter(role => !roleIds.includes(role.id));
      await this.userRepository.save(user);

      return {
        success: true,
        message: 'Roles removidos correctamente',
        data: { ...user, password: undefined }
      };
    } catch (error) {
      throw new HttpException(
        `Error al remover roles: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async getCoaches() {
    try {
      const coaches = await this.userRepository.find({
        where: { userType: UserType.COACH, isActive: true },
        select: ['id', 'username', 'firstName', 'lastName', 'email', 'phone']
      });
      
      return {
        success: true,
        data: coaches,
        count: coaches.length
      };
    } catch (error) {
      throw new HttpException(
        `Error al obtener coaches: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getSpecialists() {
    try {
      const specialists = await this.userRepository.find({
        where: { userType: UserType.SPECIALIST, isActive: true },
        select: ['id', 'username', 'firstName', 'lastName', 'email', 'phone']
      });
      
      return {
        success: true,
        data: specialists,
        count: specialists.length
      };
    } catch (error) {
      throw new HttpException(
        `Error al obtener especialistas: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
