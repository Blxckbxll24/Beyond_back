import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class, ClassType, ClassLevel, ClassStatus } from '../../classes/entities/class.entity';
import { User, UserType } from '../../user/entities/user.entity';

@Injectable()
export class ClassesSeeder {
  constructor(
    @InjectRepository(Class) private classRepository: Repository<Class>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async seed() {
    console.log('🌱 Seeding classes...');

    // Obtener todos los coaches
    const coaches = await this.userRepository.find({
      where: { userType: UserType.COACH, isActive: true }
    });

    if (coaches.length === 0) {
      console.log('⚠️  No hay coaches disponibles. Ejecuta primero el seeder de coaches.');
      return;
    }

    const now = new Date();
    const classes = [
      // Clases para esta semana
      {
        name: 'Pilates Mat Principiantes',
        description: 'Clase de Pilates en colchoneta para principiantes. Aprende los fundamentos básicos del método Pilates.',
        type: ClassType.MAT_PILATES,
        level: ClassLevel.BEGINNER,
        startTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000), // Mañana a las 9:00
        endTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // Mañana a las 10:00
        maxCapacity: 12,
        price: 25.00,
        room: 'Sala A',
        equipment: 'Colchonetas, pelotas de pilates',
        instructorId: coaches[0].id
      },
      {
        name: 'Reformer Intermedio',
        description: 'Clase de Pilates en Reformer para nivel intermedio. Fortalece y alarga todo el cuerpo.',
        type: ClassType.REFORMER,
        level: ClassLevel.INTERMEDIATE,
        startTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // Mañana a las 18:00
        endTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000), // Mañana a las 19:00
        maxCapacity: 6,
        price: 45.00,
        room: 'Sala Reformer',
        equipment: 'Reformers',
        instructorId: coaches[1].id
      },
      {
        name: 'Pilates Prenatal',
        description: 'Clase especializada para mujeres embarazadas. Ejercicios seguros y efectivos.',
        type: ClassType.PRENATAL,
        level: ClassLevel.ALL_LEVELS,
        startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // Pasado mañana a las 10:00
        endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), // Pasado mañana a las 11:00
        maxCapacity: 8,
        price: 35.00,
        room: 'Sala B',
        equipment: 'Colchonetas, cojines, pelotas',
        instructorId: coaches[2].id
      },
      {
        name: 'Cadillac Avanzado',
        description: 'Clase avanzada en Cadillac. Para estudiantes con experiencia en Pilates.',
        type: ClassType.CADILLAC,
        level: ClassLevel.ADVANCED,
        startTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000), // En 3 días a las 17:00
        endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // En 3 días a las 18:00
        maxCapacity: 4,
        price: 55.00,
        room: 'Sala Cadillac',
        equipment: 'Cadillac',
        instructorId: coaches[3 % coaches.length].id // Usa módulo para evitar errores si hay menos coaches
      },
      {
        name: 'Mat Pilates Todos los Niveles',
        description: 'Clase abierta para todos los niveles. Modificaciones disponibles.',
        type: ClassType.MAT_PILATES,
        level: ClassLevel.ALL_LEVELS,
        startTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000), // En 4 días a las 19:00
        endTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000), // En 4 días a las 20:00
        maxCapacity: 15,
        price: 28.00,
        room: 'Sala Principal',
        equipment: 'Colchonetas, bandas elásticas',
        instructorId: coaches[0].id
      },
      {
        name: 'Chair Pilates',
        description: 'Clase en Wunda Chair. Trabaja equilibrio, fuerza y precisión.',
        type: ClassType.CHAIR,
        level: ClassLevel.INTERMEDIATE,
        startTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // En 5 días a las 8:00
        endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000), // En 5 días a las 9:00
        maxCapacity: 6,
        price: 40.00,
        room: 'Sala C',
        equipment: 'Wunda Chairs',
        instructorId: coaches[1].id // 👈 CORREGIDO: era "chairs[1].id"
      },
      {
        name: 'Pilates Rehabilitación',
        description: 'Clase terapéutica para recuperación de lesiones. Requiere autorización médica.',
        type: ClassType.REHABILITATION,
        level: ClassLevel.BEGINNER,
        startTime: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // En 6 días a las 16:00
        endTime: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000), // En 6 días a las 17:00
        maxCapacity: 4,
        price: 60.00,
        room: 'Sala Terapia',
        equipment: 'Equipos adaptados',
        instructorId: coaches[2].id
      },
      {
        name: 'Barrel Pilates',
        description: 'Clase en Spine Corrector y Ladder Barrel. Mejora la flexibilidad espinal.',
        type: ClassType.BARREL,
        level: ClassLevel.INTERMEDIATE,
        startTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), // En 7 días a las 11:00
        endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000), // En 7 días a las 12:00
        maxCapacity: 5,
        price: 50.00,
        room: 'Sala D',
        equipment: 'Spine Corrector, Ladder Barrel',
        instructorId: coaches[3 % coaches.length].id 
      }
    ];

    for (const classData of classes) {
      const existingClass = await this.classRepository.findOne({
        where: { 
          name: classData.name,
          startTime: classData.startTime 
        }
      });

      if (!existingClass) {
        const newClass = this.classRepository.create(classData);
        await this.classRepository.save(newClass);
        console.log(`✅ Clase "${classData.name}" creada para ${classData.startTime.toLocaleDateString()}`);
      } else {
        console.log(`⚠️  Clase "${classData.name}" ya existe`);
      }
    }
  }
}