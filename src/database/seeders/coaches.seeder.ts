import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserType } from '../../user/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CoachesSeeder {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}

  async seed() {
    console.log('🌱 Seeding coaches...');

    const coachRole = await this.roleRepository.findOne({
      where: { name: 'coach' }
    });

    const coaches = [
      {
        username: 'sofia_martinez',
        email: 'sofia@beyond.com',
        password: 'coach123',
        firstName: 'Sofia',
        lastName: 'Martinez',
        phone: '+1234567890',
        userType: UserType.COACH,
      },
      {
        username: 'carlos_ruiz',
        email: 'carlos@beyond.com',
        password: 'coach123',
        firstName: 'Carlos',
        lastName: 'Ruiz',
        phone: '+1234567891',
        userType: UserType.COACH,
      },
      {
        username: 'ana_lopez',
        email: 'ana@beyond.com',
        password: 'coach123',
        firstName: 'Ana',
        lastName: 'Lopez',
        phone: '+1234567892',
        userType: UserType.COACH,
      },
      {
        username: 'miguel_torres',
        email: 'miguel@beyond.com',
        password: 'coach123',
        firstName: 'Miguel',
        lastName: 'Torres',
        phone: '+1234567893',
        userType: UserType.COACH,
      }
    ];

    for (const coachData of coaches) {
      const existingCoach = await this.userRepository.findOne({
        where: { email: coachData.email }
      });

      if (!existingCoach) {
        const hashedPassword = await bcrypt.hash(coachData.password, 10);

        const coach = this.userRepository.create({
          ...coachData,
          password: hashedPassword,
          roles: coachRole ? [coachRole] : []
        });

        await this.userRepository.save(coach);
        console.log(`✅ Coach ${coachData.firstName} ${coachData.lastName} creado`);
      } else {
        console.log(`⚠️  Coach ${coachData.firstName} ${coachData.lastName} ya existe`);
      }
    }
  }
}