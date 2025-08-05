import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserType } from '../../user/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminSeeder {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}

  async seed() {
    console.log('🌱 Seeding admin user...');

    const adminEmail = 'admin@beyond.com';
    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      const adminRole = await this.roleRepository.findOne({
        where: { name: 'admin' }
      });

      const hashedPassword = await bcrypt.hash('admin123', 10);

      const admin = this.userRepository.create({
        username: 'admin',
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Administrador',
        lastName: 'Sistema',
        userType: UserType.ADMIN,
        roles: adminRole ? [adminRole] : []
      });

      await this.userRepository.save(admin);
      console.log('✅ Usuario administrador creado');
      console.log(`📧 Email: ${adminEmail}`);
      console.log('🔒 Password: admin123');
    } else {
      console.log('⚠️  Usuario administrador ya existe');
    }
  }
}