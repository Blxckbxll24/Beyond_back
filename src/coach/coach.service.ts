import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, Between } from 'typeorm';
import { Class } from '../classes/entities/class.entity';
import { ClassEnrollment } from '../classes/entities/class-enrollment.entity';
import { User } from '../user/entities/user.entity';
import { CreateClassDto } from '../classes/dto/create-class.dto';
import { UpdateClassDto } from '../classes/dto/update-class.dto';

@Injectable()
export class CoachService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(ClassEnrollment)
    private readonly enrollmentRepository: Repository<ClassEnrollment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getDashboardStats(coachId: number) {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      // Clases de hoy
      const todayClassesCount = await this.classRepository.count({
        where: {
          coachId,
          startTime: Between(startOfDay, endOfDay)
        }
      });

      // Total de clases
      const totalClasses = await this.classRepository.count({
        where: { coachId }
      });

      // Estudiantes activos (inscripciones futuras)
      const activeStudents = await this.enrollmentRepository
        .createQueryBuilder('enrollment')
        .innerJoin('enrollment.class', 'class')
        .where('class.coachId = :coachId', { coachId })
        .andWhere('class.startTime >= :now', { now: new Date() })
        .getCount();

      return {
        success: true,
        data: {
          todayClasses: todayClassesCount,
          totalClasses,
          activeStudents,
          weeklyStats: {
            classes: totalClasses,
            attendance: activeStudents,
            attendanceRate: activeStudents > 0 ? Math.round((activeStudents / totalClasses) * 100) : 0
          }
        }
      };
    } catch (error) {
      throw new HttpException(
        `Error obteniendo estadísticas: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getCoachClasses(coachId: number, filters: any = {}) {
    try {
      const queryBuilder = this.classRepository.createQueryBuilder('class')
        .leftJoinAndSelect('class.coach', 'coach')
        .where('class.coachId = :coachId', { coachId });

      if (filters.date) {
        const filterDate = new Date(filters.date);
        const startOfDay = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
        const endOfDay = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate() + 1);
        
        queryBuilder.andWhere('class.startTime >= :startOfDay', { startOfDay })
                   .andWhere('class.startTime < :endOfDay', { endOfDay });
      }

      if (filters.status === 'upcoming') {
        queryBuilder.andWhere('class.startTime > :now', { now: new Date() });
      } else if (filters.status === 'completed') {
        queryBuilder.andWhere('class.startTime < :now', { now: new Date() });
      }

      const classes = await queryBuilder.orderBy('class.startTime', 'ASC').getMany();

      return {
        success: true,
        data: classes
      };
    } catch (error) {
      throw new HttpException(
        `Error obteniendo clases: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createClass(coachId: number, createClassDto: CreateClassDto) {
    try {
      // Combinar fecha y hora
      const startDateTime = new Date(`${createClassDto.date}T${createClassDto.startTime}`);
      const endDateTime = new Date(`${createClassDto.date}T${createClassDto.endTime}`);

      const newClass = this.classRepository.create({
        name: createClassDto.name,
        description: createClassDto.description,
        type: createClassDto.type,
        level: createClassDto.level,
        startTime: startDateTime,
        endTime: endDateTime,
        duration: createClassDto.duration,
        maxEnrollments: createClassDto.capacity,
        currentEnrollments: 0,
        price: createClassDto.price || 0,
        equipment: createClassDto.equipment || [],
        notes: createClassDto.notes || '',
        coachId,
      });

      const savedClass = await this.classRepository.save(newClass);

      return {
        success: true,
        message: 'Clase creada exitosamente',
        data: savedClass
      };
    } catch (error) {
      throw new HttpException(
        `Error creando clase: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async getTodayClasses(coachId: number) {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const classes = await this.classRepository.find({
        where: {
          coachId,
          startTime: Between(startOfDay, endOfDay)
        },
        order: { startTime: 'ASC' }
      });

      return {
        success: true,
        data: classes
      };
    } catch (error) {
      throw new HttpException(
        `Error obteniendo clases de hoy: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getClassDetails(classId: number, coachId: number) {
    try {
      const classEntity = await this.classRepository.findOne({
        where: { id: classId, coachId },
        relations: ['coach']
      });

      if (!classEntity) {
        throw new HttpException('Clase no encontrada', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: classEntity
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error obteniendo detalles de la clase: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateClass(classId: number, coachId: number, updateClassDto: UpdateClassDto) {
    try {
      const classEntity = await this.classRepository.findOne({
        where: { id: classId, coachId }
      });

      if (!classEntity) {
        throw new HttpException('Clase no encontrada', HttpStatus.NOT_FOUND);
      }

      // Preparar datos de actualización
      const updateData: any = {};

      if (updateClassDto.name) updateData.name = updateClassDto.name;
      if (updateClassDto.description) updateData.description = updateClassDto.description;
      if (updateClassDto.type) updateData.type = updateClassDto.type;
      if (updateClassDto.level) updateData.level = updateClassDto.level;
      if (updateClassDto.duration) updateData.duration = updateClassDto.duration;
      if (updateClassDto.capacity) updateData.maxEnrollments = updateClassDto.capacity;
      if (updateClassDto.price !== undefined) updateData.price = updateClassDto.price;
      if (updateClassDto.equipment) updateData.equipment = updateClassDto.equipment;
      if (updateClassDto.notes) updateData.notes = updateClassDto.notes;

      // Actualizar fechas si se proporcionan
      if (updateClassDto.date && updateClassDto.startTime) {
        updateData.startTime = new Date(`${updateClassDto.date}T${updateClassDto.startTime}`);
      }
      if (updateClassDto.date && updateClassDto.endTime) {
        updateData.endTime = new Date(`${updateClassDto.date}T${updateClassDto.endTime}`);
      }

      await this.classRepository.update(classId, updateData);
      
      const updatedClass = await this.classRepository.findOne({
        where: { id: classId }
      });

      return {
        success: true,
        message: 'Clase actualizada exitosamente',
        data: updatedClass
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error actualizando clase: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async deleteClass(classId: number, coachId: number) {
    try {
      const classEntity = await this.classRepository.findOne({
        where: { id: classId, coachId }
      });

      if (!classEntity) {
        throw new HttpException('Clase no encontrada', HttpStatus.NOT_FOUND);
      }

      // Verificar si hay inscripciones
      const enrollmentCount = await this.enrollmentRepository.count({
        where: { classId }
      });

      if (enrollmentCount > 0) {
        throw new HttpException(
          'No se puede eliminar una clase con inscripciones',
          HttpStatus.BAD_REQUEST
        );
      }

      await this.classRepository.remove(classEntity);

      return {
        success: true,
        message: 'Clase eliminada exitosamente'
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error eliminando clase: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async getClassStudents(classId: number, coachId: number) {
    try {
      const classEntity = await this.classRepository.findOne({
        where: { id: classId, coachId }
      });

      if (!classEntity) {
        throw new HttpException('Clase no encontrada', HttpStatus.NOT_FOUND);
      }

      const enrollments = await this.enrollmentRepository.find({
        where: { classId },
        relations: ['user']
      });

      return {
        success: true,
        data: enrollments.map(enrollment => ({
          id: enrollment.id,
          status: enrollment.status,
          enrollmentDate: enrollment.enrollmentDate,
          attendanceDate: enrollment.attendanceDate,
          user: {
            id: enrollment.user.id,
            firstName: enrollment.user.firstName,
            lastName: enrollment.user.lastName,
            email: enrollment.user.email
          }
        }))
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error obteniendo estudiantes: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}