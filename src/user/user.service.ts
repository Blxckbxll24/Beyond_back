import { Injectable, HttpException, HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
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
      console.log('📝 Creando usuario con datos:', createUserDto);

      // ✅ MAPEAR: role a userType si viene role
      if (createUserDto.role && !createUserDto.userType) {
        const roleMapping = {
          'admin': UserType.ADMIN,
          'coach': UserType.COACH,  
          'client': UserType.CLIENT,
          'specialist': UserType.SPECIALIST
        };
        createUserDto.userType = roleMapping[createUserDto.role.toLowerCase()] || UserType.CLIENT;
      }

      // Hash de la password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // ✅ ARREGLAR: Tipos para fecha de nacimiento
      let processedDateOfBirth: string | undefined = undefined;
      if (createUserDto.dateOfBirth) {
        try {
          // Convertir a formato de fecha simple (YYYY-MM-DD)
          const date = new Date(createUserDto.dateOfBirth);
          processedDateOfBirth = date.toISOString().split('T')[0]; // Solo la fecha, no la hora
          console.log('📅 Fecha procesada:', createUserDto.dateOfBirth, '->', processedDateOfBirth);
        } catch (error) {
          console.warn('⚠️ Error procesando fecha:', error);
          processedDateOfBirth = undefined;
        }
      }

      // ✅ ARREGLAR: Crear objeto con tipos correctos
      const userData: Partial<User> = {
        username: createUserDto.username,
        email: createUserDto.email,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        phone: createUserDto.phone,
        userType: createUserDto.userType || UserType.CLIENT,
        dateOfBirth: processedDateOfBirth,
        isActive: createUserDto.isActive !== undefined ? createUserDto.isActive : true,
        qrCode: createUserDto.qrCode,
        qrActive: createUserDto.qrActive !== undefined ? createUserDto.qrActive : false
      };

      // Remover propiedades undefined para evitar problemas
      Object.keys(userData).forEach(key => {
        if (userData[key] === undefined) {
          delete userData[key];
        }
      });

      console.log('💾 Guardando usuario con datos procesados:', userData);

      const user = this.userRepository.create(userData);
      const savedUser = await this.userRepository.save(user);

      // ✅ ARREGLAR: savedUser es un User, no un array
      const { password, ...result } = savedUser;
      
      console.log('✅ Usuario creado exitosamente:', result.username);
      return {
        success: true,
        data: result,
        message: 'Usuario creado correctamente'
      };

    } catch (error) {
      console.error('❌ Error creando usuario:', error);
      
      if (error.code === '23505') { // Duplicate key error
        const detail = error.detail || '';
        if (detail.includes('username')) {
          throw new BadRequestException('El nombre de usuario ya existe');
        } else if (detail.includes('email')) {
          throw new BadRequestException('El email ya existe');
        }
      }
      
      // Error específico de fecha
      if (error.message.includes('Incorrect date value') || error.message.includes('dateOfBirth')) {
        throw new BadRequestException('Formato de fecha de nacimiento inválido. Use formato YYYY-MM-DD.');
      }
      
      throw new BadRequestException(`Error creando usuario: ${error.message}`);
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
      console.log('📝 Actualizando usuario ID:', id, 'con datos:', updateUserDto);

      // ✅ MAPEAR: role a userType si viene role
      if (updateUserDto.role && !updateUserDto.userType) {
        const roleMapping = {
          'admin': UserType.ADMIN,
          'coach': UserType.COACH,  
          'client': UserType.CLIENT,
          'specialist': UserType.SPECIALIST
        };
        updateUserDto.userType = roleMapping[updateUserDto.role.toLowerCase()] || UserType.CLIENT;
      }

      // Si viene password, hashearla
      if (updateUserDto.password && updateUserDto.password.trim()) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      } else {
        // Si no hay password nueva, no actualizar ese campo
        delete updateUserDto.password;
      }

      // ✅ PROCESAR: Fecha de nacimiento si viene
      if (updateUserDto.dateOfBirth) {
        try {
          const date = new Date(updateUserDto.dateOfBirth);
          updateUserDto.dateOfBirth = date.toISOString().split('T')[0];
        } catch (error) {
          console.warn('⚠️ Error procesando fecha en update:', error);
          delete updateUserDto.dateOfBirth;
        }
      }

      // ✅ LIMPIAR: Remover el campo role ya que no existe en la entidad
      const { role, ...updateData } = updateUserDto;

      // Remover propiedades undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      console.log('💾 Actualizando con datos limpios:', updateData);

      await this.userRepository.update(id, updateData);
      
      const updatedUser = await this.userRepository.findOne({ 
        where: { id },
        relations: ['roles']
      });
      
      if (!updatedUser) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // No retornar la password
      const { password, ...result } = updatedUser;
      
      console.log('✅ Usuario actualizado exitosamente:', result.username);
      return {
        success: true,
        data: result,
        message: 'Usuario actualizado correctamente'
      };

    } catch (error) {
      console.error('❌ Error actualizando usuario:', error);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      if (error.code === '23505') {
        const detail = error.detail || '';
        if (detail.includes('username')) {
          throw new BadRequestException('El nombre de usuario ya existe');
        } else if (detail.includes('email')) {
          throw new BadRequestException('El email ya existe');
        }
      }
      
      throw new BadRequestException(`Error actualizando usuario: ${error.message}`);
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
      if (error instanceof HttpException) throw error;
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
        select: ['id', 'firstName', 'lastName', 'email', 'phone']
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
        select: ['id', 'firstName', 'lastName', 'email', 'phone']
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
