import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './entities/class.entity';
import { ClassEnrollment, EnrollmentStatus } from './entities/class-enrollment.entity';
import { User, UserType } from '../user/entities/user.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
    
    @InjectRepository(ClassEnrollment)
    private enrollmentRepository: Repository<ClassEnrollment>,
    
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // ✅ ÚNICO método create
  async create(createClassDto: CreateClassDto, user: any = null) {
    try {
      console.log('📝 Creando clase:', createClassDto, 'Usuario:', user?.userType);

      // Determinar coachId
      let coachId = createClassDto.coachId;
      
      if (user) {
        if (user.userType === 'coach' && !createClassDto.coachId) {
          coachId = user.id;
        } else if (user.userType === 'admin' && createClassDto.coachId) {
          coachId = createClassDto.coachId;
        }
      }

      // ✅ Verificar que el coach existe - corregido el tipo
      if (coachId) {
        const coach = await this.userRepository.findOne({
          where: { 
            id: coachId, 
            userType: UserType.COACH // ✅ Usar enum en lugar de string
          }
        });

        if (!coach) {
          throw new HttpException('Coach no encontrado', HttpStatus.NOT_FOUND);
        }
      }

      // Validar fechas
      const startTime = new Date(`${createClassDto.date}T${createClassDto.startTime}`);
      const endTime = new Date(`${createClassDto.date}T${createClassDto.endTime}`);
      
      if (startTime >= endTime) {
        throw new HttpException('La fecha de inicio debe ser anterior a la fecha de fin', HttpStatus.BAD_REQUEST);
      }
      
      if (startTime < new Date()) {
        throw new HttpException('No se puede crear una clase en el pasado', HttpStatus.BAD_REQUEST);
      }

      // Calcular duración automáticamente si no se proporciona
      const durationInMinutes = createClassDto.duration || 
        Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      const newClass = this.classRepository.create({
        name: createClassDto.name,
        description: createClassDto.description,
        type: createClassDto.type,
        level: createClassDto.level,
        startTime,
        endTime,
        duration: durationInMinutes,
        maxEnrollments: createClassDto.capacity,
        currentEnrollments: 0,
        price: createClassDto.price || 0,
        equipment: createClassDto.equipment || [],
        notes: createClassDto.notes || '',
        coachId,
      });

      const savedClass = await this.classRepository.save(newClass);
      
      console.log('✅ Clase creada exitosamente:', savedClass.id);
      return {
        success: true,
        message: 'Clase creada exitosamente',
        data: savedClass
      };
    } catch (error) {
      console.error('❌ Error creando clase:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error creando clase: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // ✅ Obtener clases disponibles
  async getAvailableClasses(filters: any = {}) {
    try {
      console.log('🎯 Obteniendo clases disponibles', filters);

      const queryBuilder = this.classRepository.createQueryBuilder('class')
        .leftJoinAndSelect('class.coach', 'coach')
        .where('class.status = :status', { status: 'SCHEDULED' })
        .andWhere('class.startTime > :now', { now: new Date() })
        .andWhere('class.currentEnrollments < class.maxEnrollments');

      // Filtros adicionales
      if (filters.coachId) {
        queryBuilder.andWhere('class.coachId = :coachId', { coachId: filters.coachId });
      }
      
      if (filters.type) {
        queryBuilder.andWhere('class.type = :type', { type: filters.type });
      }
      
      if (filters.date) {
        const targetDate = new Date(filters.date);
        const nextDay = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);
        queryBuilder.andWhere('class.startTime >= :startDate', { startDate: targetDate })
                   .andWhere('class.startTime < :endDate', { endDate: nextDay });
      }

      queryBuilder.orderBy('class.startTime', 'ASC');

      const classes = await queryBuilder.getMany();

      return {
        success: true,
        data: classes,
        count: classes.length
      };

    } catch (error) {
      console.error('❌ Error obteniendo clases disponibles:', error);
      throw new HttpException(`Error obteniendo clases: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  // ✅ Obtener clases del usuario
  async getUserClasses(userId: number, filters: any = {}) {
    try {
      console.log(`📚 Obteniendo clases del usuario ${userId}`, filters);

      const queryBuilder = this.enrollmentRepository.createQueryBuilder('enrollment')
        .leftJoinAndSelect('enrollment.class', 'class')
        .leftJoinAndSelect('class.coach', 'coach')
        .where('enrollment.userId = :userId', { userId })
        .andWhere('enrollment.status IN (:...statuses)', { 
          statuses: [EnrollmentStatus.ENROLLED, EnrollmentStatus.ATTENDED, EnrollmentStatus.CANCELLED] 
        });

      // Filtros adicionales
      if (filters.date) {
        const targetDate = new Date(filters.date);
        const nextDay = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);
        queryBuilder.andWhere('class.startTime >= :startDate', { startDate: targetDate })
                   .andWhere('class.startTime < :endDate', { endDate: nextDay });
      }

      if (filters.month && filters.year) {
        const startOfMonth = new Date(filters.year, filters.month - 1, 1);
        const endOfMonth = new Date(filters.year, filters.month, 0, 23, 59, 59);
        queryBuilder.andWhere('class.startTime >= :startOfMonth', { startOfMonth })
                   .andWhere('class.startTime <= :endOfMonth', { endOfMonth });
      }

      if (filters.status) {
        queryBuilder.andWhere('enrollment.status = :enrollmentStatus', { enrollmentStatus: filters.status });
      }

      queryBuilder.orderBy('class.startTime', 'ASC');

      const enrollments = await queryBuilder.getMany();
      
      // Transformar datos para incluir información de inscripción
      const classes = enrollments.map(enrollment => ({
        ...enrollment.class,
        enrollmentId: enrollment.id,
        enrollmentStatus: enrollment.status,
        enrollmentDate: enrollment.enrollmentDate
      }));

      console.log(`✅ Encontradas ${classes.length} clases para el usuario ${userId}`);

      return {
        success: true,
        data: classes,
        count: classes.length
      };

    } catch (error) {
      console.error('❌ Error obteniendo clases del usuario:', error);
      throw new HttpException(`Error obteniendo clases: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  // ✅ Obtener clases del coach
  async getCoachClasses(coachId: number, filters: any = {}) {
    try {
      console.log(`👨‍🏫 Obteniendo clases del coach ${coachId}`, filters);

      const queryBuilder = this.classRepository.createQueryBuilder('class')
        .leftJoinAndSelect('class.enrollments', 'enrollments')
        .leftJoinAndSelect('enrollments.user', 'student')
        .where('class.coachId = :coachId', { coachId });

      // Filtros
      if (filters.status) {
        queryBuilder.andWhere('class.status = :status', { status: filters.status });
      }
      
      if (filters.type) {
        queryBuilder.andWhere('class.type = :type', { type: filters.type });
      }
      
      if (filters.date) {
        const targetDate = new Date(filters.date);
        const nextDay = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);
        queryBuilder.andWhere('class.startTime >= :startDate', { startDate: targetDate })
                   .andWhere('class.startTime < :endDate', { endDate: nextDay });
      }

      queryBuilder.orderBy('class.startTime', 'DESC');

      const classes = await queryBuilder.getMany();

      console.log(`✅ Encontradas ${classes.length} clases para el coach ${coachId}`);

      return {
        success: true,
        data: classes,
        count: classes.length
      };

    } catch (error) {
      console.error('❌ Error obteniendo clases del coach:', error);
      throw new HttpException(`Error obteniendo clases: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  // ✅ Método update corregido
  async update(id: number, updateClassDto: UpdateClassDto, user: any = null) {
    try {
      const classEntity = await this.classRepository.findOne({ 
        where: { id },
        relations: ['coach']
      });

      if (!classEntity) {
        throw new HttpException('Clase no encontrada', HttpStatus.NOT_FOUND);
      }

      // Verificar permisos
      if (user && user.userType !== 'admin' && classEntity.coachId !== user.id) {
        throw new HttpException('No tienes permisos para editar esta clase', HttpStatus.FORBIDDEN);
      }

      // Preparar datos de actualización
      const updateData: any = {};
      if (updateClassDto.name) updateData.name = updateClassDto.name;
      if (updateClassDto.description) updateData.description = updateClassDto.description;
      if (updateClassDto.type) updateData.type = updateClassDto.type;
      if (updateClassDto.level) updateData.level = updateClassDto.level;
      if (updateClassDto.duration !== undefined) updateData.duration = updateClassDto.duration;
      if (updateClassDto.capacity !== undefined) updateData.maxEnrollments = updateClassDto.capacity;
      if (updateClassDto.price !== undefined) updateData.price = updateClassDto.price;
      if (updateClassDto.equipment) updateData.equipment = updateClassDto.equipment;
      if (updateClassDto.notes) updateData.notes = updateClassDto.notes;
      if (updateClassDto.coachId) updateData.coachId = updateClassDto.coachId;

      // Actualizar fechas si se proporcionan
      if (updateClassDto.date && updateClassDto.startTime && updateClassDto.endTime) {
        const startTime = new Date(`${updateClassDto.date}T${updateClassDto.startTime}`);
        const endTime = new Date(`${updateClassDto.date}T${updateClassDto.endTime}`);
        
        updateData.startTime = startTime;
        updateData.endTime = endTime;
        
        // Recalcular duración si no se especificó
        if (updateClassDto.duration === undefined) {
          updateData.duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
        }
      }

      await this.classRepository.update(id, updateData);

      const updatedClass = await this.classRepository.findOne({
        where: { id },
        relations: ['coach']
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

  // ✅ Método remove corregido
  async remove(id: number, user: any = null) {
    try {
      const classEntity = await this.classRepository.findOne({ 
        where: { id },
        relations: ['coach']
      });

      if (!classEntity) {
        throw new HttpException('Clase no encontrada', HttpStatus.NOT_FOUND);
      }

      // Verificar permisos
      if (user && user.userType !== 'admin' && classEntity.coachId !== user.id) {
        throw new HttpException('No tienes permisos para eliminar esta clase', HttpStatus.FORBIDDEN);
      }

      // Eliminar inscripciones primero
      await this.enrollmentRepository.delete({ class: { id } });
      
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

  // ✅ Resto de métodos existentes (findAll, findOne, etc.)
  async findAll() {
    try {
      const classes = await this.classRepository.find({
        relations: ['coach', 'enrollments', 'enrollments.user'],
        order: { startTime: 'DESC' }
      });

      return {
        success: true,
        data: classes,
        count: classes.length
      };
    } catch (error) {
      throw new HttpException(`Error obteniendo clases: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {
    try {
      const classEntity = await this.classRepository.findOne({
        where: { id },
        relations: ['coach', 'enrollments', 'enrollments.user']
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
      throw new HttpException(`Error obteniendo clase: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  // ✅ AGREGAR este método faltante
  async findByDateRange(startDate: Date, endDate: Date) {
    try {
      const classes = await this.classRepository.find({
        where: {
          startTime: {
            $gte: startDate,
            $lte: endDate,
          } as any
        },
        relations: ['coach', 'enrollments'],
        order: { startTime: 'ASC' }
      });

      return {
        success: true,
        data: classes,
        count: classes.length
      };
    } catch (error) {
      console.error('❌ Error obteniendo clases por rango de fecha:', error);
      throw new HttpException(`Error obteniendo clases: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  // ✅ AGREGAR: Cancelar inscripción
  async cancelEnrollment(classId: number, userId: number) {
    try {
      console.log(`❌ Cancelando inscripción - Usuario: ${userId}, Clase: ${classId}`);

      // Buscar la inscripción activa
      const enrollment = await this.enrollmentRepository.findOne({
        where: { 
          class: { id: classId },
          user: { id: userId },
          status: EnrollmentStatus.ENROLLED
        },
        relations: ['class']
      });

      if (!enrollment) {
        throw new HttpException('Inscripción no encontrada o ya cancelada', HttpStatus.NOT_FOUND);
      }

      // Verificar si se puede cancelar (ej: al menos 2 horas antes)
      const classTime = new Date(enrollment.class.startTime);
      const now = new Date();
      const hoursUntilClass = (classTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilClass < 2) {
        throw new HttpException('No se puede cancelar con menos de 2 horas de anticipación', HttpStatus.BAD_REQUEST);
      }

      // Actualizar estado de inscripción a cancelada
      await this.enrollmentRepository.update(enrollment.id, {
        status: EnrollmentStatus.CANCELLED
      });

      // Decrementar contador de inscripciones en la clase
      await this.classRepository.update(classId, {
        currentEnrollments: Math.max(0, enrollment.class.currentEnrollments - 1)
      });

      console.log('✅ Inscripción cancelada exitosamente');
      return {
        success: true,
        message: 'Inscripción cancelada exitosamente',
        data: {
          enrollmentId: enrollment.id,
          classId: classId,
          status: 'cancelled'
        }
      };
    } catch (error) {
      console.error('❌ Error cancelando inscripción:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error cancelando inscripción: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  // ✅ VERIFICAR que el método enrollInClass también esté presente
  async enrollInClass(classId: number, userId: number) {
    try {
      console.log(`📝 Inscribiendo usuario ${userId} a clase ${classId}`);

      // Verificar que la clase existe y está disponible
      const classEntity = await this.classRepository.findOne({
        where: { id: classId },
        relations: ['enrollments']
      });

      if (!classEntity) {
        throw new HttpException('Clase no encontrada', HttpStatus.NOT_FOUND);
      }

      if (classEntity.currentEnrollments >= classEntity.maxEnrollments) {
        throw new HttpException('La clase está llena', HttpStatus.CONFLICT);
      }

      if (classEntity.status !== 'SCHEDULED') {
        throw new HttpException('La clase no está disponible para inscripción', HttpStatus.BAD_REQUEST);
      }

      if (new Date(classEntity.startTime) < new Date()) {
        throw new HttpException('No se puede inscribir a una clase que ya comenzó', HttpStatus.BAD_REQUEST);
      }

      // Verificar que el usuario no esté ya inscrito
      const existingEnrollment = await this.enrollmentRepository.findOne({
        where: { 
          class: { id: classId },
          user: { id: userId },
          status: EnrollmentStatus.ENROLLED
        }
      });

      if (existingEnrollment) {
        throw new HttpException('Ya estás inscrito en esta clase', HttpStatus.CONFLICT);
      }

      // Crear nueva inscripción
      const enrollment = this.enrollmentRepository.create({
        class: classEntity,
        user: { id: userId } as User,
        status: EnrollmentStatus.ENROLLED,
        enrollmentDate: new Date()
      });

      const savedEnrollment = await this.enrollmentRepository.save(enrollment);

      // Incrementar contador de inscripciones
      await this.classRepository.update(classId, {
        currentEnrollments: classEntity.currentEnrollments + 1
      });

      console.log('✅ Usuario inscrito exitosamente a la clase');
      return {
        success: true,
        message: 'Inscripción exitosa',
        data: savedEnrollment
      };

    } catch (error) {
      console.error('❌ Error inscribiendo a la clase:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(`Error en inscripción: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}