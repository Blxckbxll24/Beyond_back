import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Injectable()
export class RolesSeeder {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}

  async seed() {
    const roles = [
      { name: 'admin', description: 'Administrador del sistema' },
      { name: 'coach', description: 'Entrenador de Pilates' },
      { name: 'client', description: 'Cliente del centro' },
      { name: 'specialist', description: 'Especialista médico' },
    ];

    console.log('🌱 Seeding roles...');
    
    for (const roleData of roles) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name }
      });

      if (!existingRole) {
        const role = this.roleRepository.create(roleData);
        await this.roleRepository.save(role);
        console.log(`✅ Rol ${roleData.name} creado`);
      } else {
        console.log(`⚠️  Rol ${roleData.name} ya existe`);
      }
    }
  }
}