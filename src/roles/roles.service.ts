import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    try {
      const existingRole = await this.roleRepository.findOne({
        where: { name: createRoleDto.name }
      });

      if (existingRole) {
        throw new HttpException('El rol ya existe', HttpStatus.CONFLICT);
      }

      const role = this.roleRepository.create(createRoleDto);
      await this.roleRepository.save(role);
      
      return {
        success: true,
        message: 'Rol creado correctamente',
        data: role
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al crear el rol: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async findAll() {
    try {
      const roles = await this.roleRepository.find({
        where: { isActive: true },
        order: { name: 'ASC' }
      });
      
      return {
        success: true,
        data: roles,
        count: roles.length
      };
    } catch (error) {
      throw new HttpException(
        `Error al obtener los roles: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: number) {
    try {
      const role = await this.roleRepository.findOne({
        where: { id, isActive: true },
        relations: ['users']
      });

      if (!role) {
        throw new HttpException('Rol no encontrado', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: role
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al obtener el rol: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    try {
      const role = await this.roleRepository.findOne({ where: { id } });
      
      if (!role) {
        throw new HttpException('Rol no encontrado', HttpStatus.NOT_FOUND);
      }

      await this.roleRepository.update(id, updateRoleDto);
      const updatedRole = await this.roleRepository.findOne({ where: { id } });

      return {
        success: true,
        message: 'Rol actualizado correctamente',
        data: updatedRole
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al actualizar el rol: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async remove(id: number) {
    try {
      const role = await this.roleRepository.findOne({
        where: { id },
        relations: ['users']
      });

      if (!role) {
        throw new HttpException('Rol no encontrado', HttpStatus.NOT_FOUND);
      }

      if (role.users && role.users.length > 0) {
        throw new HttpException(
          'No se puede eliminar el rol porque tiene usuarios asignados',
          HttpStatus.CONFLICT
        );
      }

      await this.roleRepository.update(id, { isActive: false });

      return {
        success: true,
        message: 'Rol eliminado correctamente'
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al eliminar el rol: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
