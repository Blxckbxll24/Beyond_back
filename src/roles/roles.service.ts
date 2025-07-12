import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private  roleRepository: Repository<Role>,
  ) { }
  create(createRoleDto: CreateRoleDto) {
    const role = this.roleRepository.create(createRoleDto)
    this.roleRepository.save(role)
    return `Rol ${createRoleDto.name} creado correctamente`;
  }

  findAll() {
    return this.roleRepository.find();
  }

  findOne(id: number) {
    const role = this.roleRepository.findOne({ where: { id } });
    if (!role) {
      return `No se encontró el rol con id ${id}`;
    }
    return role;

  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = this.roleRepository.findOne({ where: { id } });
    if (!role) {
      return `No se encontró el rol con id ${id}`;
    }
    this.roleRepository.update(id, updateRoleDto);
    return `Rol ${updateRoleDto.name} actualizado correctamente`;
  }

  remove(id: number) {
    const role = this.roleRepository.findOne({ where: { id } });
    if (!role) {
      return `No se encontró el rol con id ${id}`;
    }
    this.roleRepository.delete(id);
    return `Rol con id ${id} eliminado correctamente`;
  }
}
