import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Class } from '../classes/entities/class.entity';
import { ClassEnrollment, EnrollmentStatus } from '../classes/entities/class-enrollment.entity';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { Payment, PaymentStatus, PaymentType } from '../payments/entities/payment.entity';
import { User, UserType } from '../user/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Class) private classRepository: Repository<Class>,
    @InjectRepository(ClassEnrollment) private enrollmentRepository: Repository<ClassEnrollment>,
    @InjectRepository(Appointment) private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getClassesReport(startDate: Date, endDate: Date) {
    try {
      const classes = await this.classRepository.find({
        where: {
          startTime: Between(startDate, endDate)
        },
        relations: ['instructor', 'enrollments'] // 👈 CORREGIDO: de 'coach' a 'instructor'
      });

      const totalClasses = classes.length;
      const totalEnrollments = classes.reduce((sum, cls) => sum + cls.enrollments.length, 0);
      const averageEnrollment = totalClasses > 0 ? totalEnrollments / totalClasses : 0;

      const classTypeStats = classes.reduce((acc, cls) => {
        acc[cls.type] = (acc[cls.type] || 0) + 1;
        return acc;
      }, {});

      const coachStats = classes.reduce((acc, cls) => {
        const coachName = `${cls.instructor.firstName} ${cls.instructor.lastName}`; // 👈 CORREGIDO: de 'cls.coach' a 'cls.instructor'
        if (!acc[coachName]) {
          acc[coachName] = { classes: 0, totalEnrollments: 0 };
        }
        acc[coachName].classes++;
        acc[coachName].totalEnrollments += cls.enrollments.length;
        return acc;
      }, {});

      return {
        success: true,
        data: {
          period: { startDate, endDate },
          summary: {
            totalClasses,
            totalEnrollments,
            averageEnrollment: Math.round(averageEnrollment * 100) / 100
          },
          classTypeStats,
          coachStats,
          classes
        }
      };
    } catch (error) {
      throw new HttpException(
        `Error al generar reporte de clases: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getCoachPerformanceReport(coachId: number, startDate: Date, endDate: Date) {
    try {
      const coach = await this.userRepository.findOne({
        where: { id: coachId, userType: UserType.COACH }
      });

      if (!coach) {
        throw new HttpException('Coach no encontrado', HttpStatus.NOT_FOUND);
      }

      const classes = await this.classRepository.find({
        where: {
          instructorId: coachId, // 👈 CORREGIDO: de 'coachId' a 'instructorId'
          startTime: Between(startDate, endDate)
        },
        relations: ['enrollments']
      });

      const totalClassesTaught = classes.length;
      const totalStudents = classes.reduce((sum, cls) => sum + cls.enrollments.length, 0);
      const attendedClasses = classes.reduce((sum, cls) => {
        return sum + cls.enrollments.filter(e => e.status === EnrollmentStatus.ATTENDED).length;
      }, 0);

      const attendanceRate = totalStudents > 0 ? (attendedClasses / totalStudents) * 100 : 0;

      // Calcular ganancias del coach (asumiendo 30% de comisión)
      const revenue = classes.reduce((sum, cls) => sum + (Number(cls.price) * cls.enrollments.length), 0);
      const coachEarnings = revenue * 0.3; // 30% comisión

      return {
        success: true,
        data: {
          coach: {
            id: coach.id,
            name: `${coach.firstName} ${coach.lastName}`,
            email: coach.email
          },
          period: { startDate, endDate },
          performance: {
            totalClassesTaught,
            totalStudents,
            attendedClasses,
            attendanceRate: Math.round(attendanceRate * 100) / 100,
            revenue,
            coachEarnings: Math.round(coachEarnings * 100) / 100
          },
          classes
        }
      };
    } catch (error) {
      throw new HttpException(
        `Error al generar reporte de rendimiento: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getUserProgressReport(userId: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      
      if (!user) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }

      const enrollments = await this.enrollmentRepository.find({
        where: { userId },
        relations: ['class'],
        order: { enrollmentDate: 'ASC' }
      });

      const appointments = await this.appointmentRepository.find({
        where: { clientId: userId },
        relations: ['specialist'],
        order: { scheduledDate: 'ASC' }
      });

      const totalClassesEnrolled = enrollments.length;
      const classesAttended = enrollments.filter(e => e.status === EnrollmentStatus.ATTENDED).length;
      const totalAppointments = appointments.length;
      const completedAppointments = appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length;

      const progressRate = totalClassesEnrolled > 0 ? (classesAttended / totalClassesEnrolled) * 100 : 0;

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email
          },
          progress: {
            totalClassesEnrolled,
            classesAttended,
            progressRate: Math.round(progressRate * 100) / 100,
            totalAppointments,
            completedAppointments
          },
          enrollments,
          appointments
        }
      };
    } catch (error) {
      throw new HttpException(
        `Error al generar reporte de progreso: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getFinancialReport(startDate: Date, endDate: Date) {
    try {
      const payments = await this.paymentRepository.find({
        where: {
          transactionDate: Between(startDate, endDate),
          status: PaymentStatus.COMPLETED
        },
        relations: ['user']
      });

      const totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      
      const revenueByType = payments.reduce((acc, payment) => {
        acc[payment.type] = (acc[payment.type] || 0) + Number(payment.amount);
        return acc;
      }, {} as Record<PaymentType, number>);

      const monthlyRevenue = payments.reduce((acc, payment) => {
        const month = payment.transactionDate.toISOString().substring(0, 7); // YYYY-MM
        acc[month] = (acc[month] || 0) + Number(payment.amount);
        return acc;
      }, {});

      return {
        success: true,
        data: {
          period: { startDate, endDate },
          summary: {
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            totalTransactions: payments.length,
            averageTransaction: payments.length > 0 ? Math.round((totalRevenue / payments.length) * 100) / 100 : 0
          },
          revenueByType,
          monthlyRevenue,
          payments
        }
      };
    } catch (error) {
      throw new HttpException(
        `Error al generar reporte financiero: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}