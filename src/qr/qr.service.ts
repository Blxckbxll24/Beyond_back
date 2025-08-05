import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { ClassEnrollment, EnrollmentStatus } from '../classes/entities/class-enrollment.entity';
import { Class } from '../classes/entities/class.entity';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';

@Injectable()
export class QrService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(ClassEnrollment) private enrollmentRepository: Repository<ClassEnrollment>,
    @InjectRepository(Class) private classRepository: Repository<Class>,
  ) {}

  // Generar QR único para un usuario
  async generateUserQR(userId: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      
      if (!user) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }

      // Generar código QR único si no existe
      if (!user.qrCode) {
        user.qrCode = uuidv4();
        user.qrActive = true;
        await this.userRepository.save(user);
      }

      // Generar la imagen QR
      const qrData = {
        userId: user.id,
        qrCode: user.qrCode,
        type: 'attendance',
        timestamp: new Date().toISOString()
      };

      const qrImage = await QRCode.toDataURL(JSON.stringify(qrData));

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.fullName,
            qrCode: user.qrCode
          },
          qrImage,
          qrData
        }
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al generar QR: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Marcar asistencia escaneando QR
  async markAttendanceByQR(qrCode: string, classId: number, scannedBy?: number) {
    try {
      // Buscar usuario por QR code
      const user = await this.userRepository.findOne({
        where: { qrCode, qrActive: true }
      });

      if (!user) {
        throw new HttpException('QR inválido o inactivo', HttpStatus.BAD_REQUEST);
      }

      // Verificar que la clase existe
      const classEntity = await this.classRepository.findOne({
        where: { id: classId }
      });

      if (!classEntity) {
        throw new HttpException('Clase no encontrada', HttpStatus.NOT_FOUND);
      }

      // Buscar la inscripción del usuario en esta clase
      const enrollment = await this.enrollmentRepository.findOne({
        where: { 
          userId: user.id, 
          classId: classId,
          status: EnrollmentStatus.ENROLLED 
        },
        relations: ['user', 'class']
      });

      if (!enrollment) {
        throw new HttpException(
          'El usuario no está inscrito en esta clase', 
          HttpStatus.BAD_REQUEST
        );
      }

      // Verificar que no haya marcado asistencia ya
      if (enrollment.status === EnrollmentStatus.ATTENDED) {
        throw new HttpException(
          'La asistencia ya fue marcada para este usuario', 
          HttpStatus.CONFLICT
        );
      }

      // Verificar tiempo de la clase (opcional - solo permitir marcar durante la clase)
      const now = new Date();
      const classStart = new Date(classEntity.startTime);
      const classEnd = new Date(classEntity.endTime);
      
      // Permitir marcar 15 minutos antes y 30 minutos después
      const allowedStart = new Date(classStart.getTime() - 15 * 60 * 1000);
      const allowedEnd = new Date(classEnd.getTime() + 30 * 60 * 1000);

      if (now < allowedStart || now > allowedEnd) {
        throw new HttpException(
          'Solo se puede marcar asistencia durante el horario de la clase', 
          HttpStatus.BAD_REQUEST
        );
      }

      // Marcar asistencia
      enrollment.status = EnrollmentStatus.ATTENDED;
      enrollment.attendanceDate = new Date();
      await this.enrollmentRepository.save(enrollment);

      // Actualizar último escaneo del usuario
      user.lastQrScan = new Date();
      await this.userRepository.save(user);

      return {
        success: true,
        message: 'Asistencia marcada correctamente',
        data: {
          user: {
            id: user.id,
            name: user.fullName,
            email: user.email
          },
          class: {
            id: classEntity.id,
            name: classEntity.name,
            startTime: classEntity.startTime
          },
          attendanceTime: enrollment.attendanceDate,
          scannedBy
        }
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al marcar asistencia: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // Obtener información del QR sin marcar asistencia
  async validateQR(qrCode: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { qrCode, qrActive: true },
        relations: ['enrollments', 'enrollments.class']
      });

      if (!user) {
        throw new HttpException('QR inválido o inactivo', HttpStatus.BAD_REQUEST);
      }

      // Obtener clases de hoy donde el usuario está inscrito
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const todayClasses = user.enrollments.filter(enrollment => {
        const classDate = new Date(enrollment.class.startTime);
        return classDate >= startOfDay && classDate <= endOfDay;
      });

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.fullName,
            email: user.email
          },
          todayClasses: todayClasses.map(enrollment => ({
            enrollmentId: enrollment.id,
            classId: enrollment.class.id,
            className: enrollment.class.name,
            startTime: enrollment.class.startTime,
            status: enrollment.status,
            canMarkAttendance: enrollment.status === EnrollmentStatus.ENROLLED
          }))
        }
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al validar QR: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // Regenerar QR (en caso de compromiso de seguridad)
  async regenerateUserQR(userId: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      
      if (!user) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }

      user.qrCode = uuidv4();
      await this.userRepository.save(user);

      return this.generateUserQR(userId);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al regenerar QR: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}