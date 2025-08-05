import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Class, ClassStatus } from './entities/class.entity';
import { ClassEnrollment, EnrollmentStatus } from './entities/class-enrollment.entity';
import { User, UserType } from '../user/entities/user.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class) private classRepository: Repository<Class>,
    @InjectRepository(ClassEnrollment) private enrollmentRepository: Repository<ClassEnrollment>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createClassDto: CreateClassDto) {
    try {
      // Verificar que el instructor existe y es un coach
      const instructor = await this.userRepository.findOne({
        where: { id: createClassDto.instructorId, userType: UserType.COACH }
      });

      if (!instructor) {
        throw new HttpException('Instructor no encontrado o no es un coach', HttpStatus.NOT_FOUND);
      }

      const newClass = this.classRepository.create(createClassDto);
      await this.classRepository.save(newClass);

      return {
        success: true,
        message: 'Clase creada correctamente',
        data: newClass
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al crear clase: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async findAll() {
    try {
      const classes = await this.classRepository.find({
        relations: ['instructor', 'enrollments'],
        order: { startTime: 'ASC' }
      });

      return {
        success: true,
        data: classes
      };
    } catch (error) {
      throw new HttpException(
        `Error al obtener clases: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: number) {
    try {
      const classEntity = await this.classRepository.findOne({
        where: { id },
        relations: ['instructor', 'enrollments', 'enrollments.user']
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
        `Error al obtener clase: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(id: number, updateClassDto: UpdateClassDto) {
    try {
      const classEntity = await this.classRepository.findOne({ where: { id } });

      if (!classEntity) {
        throw new HttpException('Clase no encontrada', HttpStatus.NOT_FOUND);
      }

      if (updateClassDto.instructorId) {
        const instructor = await this.userRepository.findOne({
          where: { id: updateClassDto.instructorId, userType: UserType.COACH }
        });

        if (!instructor) {
          throw new HttpException('Instructor no encontrado o no es un coach', HttpStatus.NOT_FOUND);
        }
      }

      await this.classRepository.update(id, updateClassDto);
      const updatedClass = await this.classRepository.findOne({
        where: { id },
        relations: ['instructor']
      });

      return {
        success: true,
        message: 'Clase actualizada correctamente',
        data: updatedClass
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al actualizar clase: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async remove(id: number) {
    try {
      const classEntity = await this.classRepository.findOne({ where: { id } });

      if (!classEntity) {
        throw new HttpException('Clase no encontrada', HttpStatus.NOT_FOUND);
      }

      // Eliminar inscripciones primero
      await this.enrollmentRepository.delete({ classId: id });
      
      // Luego eliminar la clase
      await this.classRepository.delete(id);

      return {
        success: true,
        message: 'Clase eliminada correctamente'
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al eliminar clase: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    try {
      const classes = await this.classRepository.find({
        where: {
          startTime: Between(startDate, endDate)
        },
        relations: ['instructor', 'enrollments'],
        order: { startTime: 'ASC' }
      });

      return {
        success: true,
        data: {
          period: { startDate, endDate },
          classes,
          count: classes.length
        }
      };
    } catch (error) {
      throw new HttpException(
        `Error al obtener clases por fecha: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async enrollUser(classId: number, userId: number, notes?: string) {
    try {
      const classEntity = await this.classRepository.findOne({
        where: { id: classId },
        relations: ['enrollments']
      });

      if (!classEntity) {
        throw new HttpException('Clase no encontrada', HttpStatus.NOT_FOUND);
      }

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }

      if (classEntity.currentEnrollments >= classEntity.maxCapacity) {
        throw new HttpException('La clase está llena', HttpStatus.CONFLICT);
      }

      const existingEnrollment = await this.enrollmentRepository.findOne({
        where: { classId, userId }
      });

      if (existingEnrollment) {
        throw new HttpException('El usuario ya está inscrito en esta clase', HttpStatus.CONFLICT);
      }

      // 👈 CORREGIDO: Crear el enrollment correctamente
      const enrollment = this.enrollmentRepository.create({
        userId,
        classId,
        enrollmentDate: new Date(),
        status: EnrollmentStatus.ENROLLED,
        ...(notes && { notes }) // 👈 Solo incluir notes si existe
      });

      const savedEnrollment = await this.enrollmentRepository.save(enrollment);

      // Actualizar contador de inscripciones
      await this.classRepository.update(classId, {
        currentEnrollments: classEntity.currentEnrollments + 1
      });

      return {
        success: true,
        message: 'Usuario inscrito en la clase correctamente',
        data: savedEnrollment
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al inscribir usuario en clase: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async markAttendance(enrollmentId: number) {
    try {
      const enrollment = await this.enrollmentRepository.findOne({
        where: { id: enrollmentId },
        relations: ['class', 'user']
      });

      if (!enrollment) {
        throw new HttpException('Inscripción no encontrada', HttpStatus.NOT_FOUND);
      }

      enrollment.status = EnrollmentStatus.ATTENDED;
      enrollment.attendanceDate = new Date();

      await this.enrollmentRepository.save(enrollment);

      return {
        success: true,
        message: 'Asistencia marcada correctamente',
        data: enrollment
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al marcar asistencia: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async getClassStatistics(classId: number) {
    try {
      const classEntity = await this.classRepository.findOne({
        where: { id: classId },
        relations: ['enrollments', 'instructor']
      });

      if (!classEntity) {
        throw new HttpException('Clase no encontrada', HttpStatus.NOT_FOUND);
      }

      const totalEnrolled = classEntity.enrollments.length;
      const totalAttended = classEntity.enrollments.filter(e => e.status === EnrollmentStatus.ATTENDED).length;
      const attendanceRate = totalEnrolled > 0 ? (totalAttended / totalEnrolled) * 100 : 0;
      const revenue = Number(classEntity.price) * totalEnrolled;

      return {
        success: true,
        data: {
          class: classEntity,
          statistics: {
            totalEnrolled,
            totalAttended,
            attendanceRate: Math.round(attendanceRate * 100) / 100,
            revenue,
            capacity: classEntity.maxCapacity,
            occupancyRate: Math.round((totalEnrolled / classEntity.maxCapacity) * 100)
          }
        }
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al obtener estadísticas: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // 👈 MÉTODO FALTANTE: findByCoach
  async findByCoach(coachId: number) {
    try {
      const coach = await this.userRepository.findOne({
        where: { id: coachId, userType: UserType.COACH }
      });

      if (!coach) {
        throw new HttpException('Coach no encontrado', HttpStatus.NOT_FOUND);
      }

      const classes = await this.classRepository.find({
        where: { instructorId: coachId },
        relations: ['enrollments', 'instructor'],
        order: { startTime: 'ASC' }
      });

      return {
        success: true,
        data: {
          coach: {
            id: coach.id,
            name: `${coach.firstName} ${coach.lastName}`,
            email: coach.email
          },
          classes,
          count: classes.length
        }
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al obtener clases del coach: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}