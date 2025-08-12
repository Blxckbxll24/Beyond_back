import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class, ClassType, ClassLevel } from '../../classes/entities/class.entity';

@Injectable()
export class ClassesSeeder {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  async seed() {
    const classesData = [
      {
        name: 'Pilates Mat Básico',
        description: 'Clase de Pilates en colchoneta para principiantes',
        type: ClassType.PILATES, // ✅ Usar solo los tipos que existen
        level: ClassLevel.BEGINNER,
        startTime: new Date('2024-12-01T09:00:00'),
        endTime: new Date('2024-12-01T10:00:00'),
        duration: 60,
        maxEnrollments: 20, // ✅ CAMBIAR maxCapacity por maxEnrollments
        price: 25000,
        equipment: ['Mat', 'Pelota'], // ✅ CAMBIAR equipment a array
        coachId: 2, // ✅ CAMBIAR instructorId por coachId
        notes: 'Traer mat propio'
      },
      {
        name: 'Yoga Flow',
        description: 'Clase de yoga dinámico',
        type: ClassType.YOGA,
        level: ClassLevel.INTERMEDIATE,
        startTime: new Date('2024-12-01T11:00:00'),
        endTime: new Date('2024-12-01T12:00:00'),
        duration: 60,
        maxEnrollments: 15,
        price: 30000,
        equipment: ['Mat'],
        coachId: 2,
        notes: 'Clase intermedia'
      },
      {
        name: 'Spinning Intenso',
        description: 'Clase de spinning de alta intensidad',
        type: ClassType.SPINNING,
        level: ClassLevel.ADVANCED,
        startTime: new Date('2024-12-01T18:00:00'),
        endTime: new Date('2024-12-01T19:00:00'),
        duration: 60,
        maxEnrollments: 25,
        price: 20000,
        equipment: ['Bicicleta'],
        coachId: 2,
        notes: 'Traer toalla y agua'
      }
    ];

    for (const classData of classesData) {
      const existingClass = await this.classRepository.findOne({
        where: { name: classData.name }
      });

      if (!existingClass) {
        const newClass = this.classRepository.create(classData); // ✅ Ya no hay problema con el create
        await this.classRepository.save(newClass);
        console.log(`✅ Clase creada: ${classData.name}`);
      }
    }

    console.log('🎯 Seeder de clases completado');
  }
}