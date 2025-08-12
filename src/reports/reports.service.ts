import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Class } from '../classes/entities/class.entity';
import { ClassEnrollment } from '../classes/entities/class-enrollment.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(ClassEnrollment)
    private readonly enrollmentRepository: Repository<ClassEnrollment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getClassAttendanceReport(startDate: Date, endDate: Date) {
    try {
      const classes = await this.classRepository.find({
        where: {
          startTime: Between(startDate, endDate)
        },
        relations: ['coach', 'enrollments']
      });

      const report = classes.map(cls => {
        const coachName = cls.coach ? `${cls.coach.firstName} ${cls.coach.lastName}` : 'Sin coach asignado';
        
        return {
          id: cls.id,
          className: cls.name,
          coachName,
          date: cls.startTime,
          enrolled: cls.currentEnrollments,
          capacity: cls.maxEnrollments,
          occupancy: Math.round((cls.currentEnrollments / cls.maxEnrollments) * 100),
          revenue: cls.price * cls.currentEnrollments
        };
      });

      return {
        success: true,
        data: report,
        summary: {
          totalClasses: classes.length,
          totalEnrolled: report.reduce((sum, cls) => sum + cls.enrolled, 0),
          totalRevenue: report.reduce((sum, cls) => sum + cls.revenue, 0),
          averageOccupancy: report.length > 0 ? Math.round(
            report.reduce((sum, cls) => sum + cls.occupancy, 0) / report.length
          ) : 0
        }
      };
    } catch (error) {
      throw new HttpException(
        `Error generando reporte de asistencia: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getCoachPerformance(coachId: number, startDate?: Date, endDate?: Date) {
    try {
      let whereCondition: any = {
        coachId: coachId,
      };

      if (startDate && endDate) {
        whereCondition.startTime = Between(startDate, endDate);
      }

      const classes = await this.classRepository.find({
        where: whereCondition,
        relations: ['enrollments', 'coach']
      });

      const totalClasses = classes.length;
      const totalEnrollments = classes.reduce((sum, cls) => sum + cls.currentEnrollments, 0);
      const totalRevenue = classes.reduce((sum, cls) => sum + (cls.price * cls.currentEnrollments), 0);
      const averageOccupancy = totalClasses > 0 
        ? Math.round((totalEnrollments / classes.reduce((sum, cls) => sum + cls.maxEnrollments, 0)) * 100)
        : 0;

      // ✅ CORREGIR: manejar el caso donde coach puede ser null
      const coach = await this.userRepository.findOne({
        where: { id: coachId }
      });

      if (!coach) {
        throw new HttpException('Coach no encontrado', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: {
          coach: {
            id: coach.id,
            name: `${coach.firstName} ${coach.lastName}`,
            email: coach.email
          },
          performance: {
            totalClasses,
            totalEnrollments,
            totalRevenue,
            averageOccupancy,
            classesDetails: classes.map(cls => ({
              id: cls.id,
              name: cls.name,
              date: cls.startTime,
              enrolled: cls.currentEnrollments,
              capacity: cls.maxEnrollments,
              revenue: cls.price * cls.currentEnrollments
            }))
          }
        }
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error obteniendo performance del coach: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ✅ AGREGAR: método getUserProgress que faltaba
  async getUserProgress(userId: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }

      const enrollments = await this.enrollmentRepository.find({
        where: { userId },
        relations: ['class'],
        order: { enrollmentDate: 'DESC' }
      });

      const completedClasses = enrollments.filter(e => e.attendanceDate !== null).length;
      const totalEnrollments = enrollments.length;
      const completionRate = totalEnrollments > 0 ? Math.round((completedClasses / totalEnrollments) * 100) : 0;

      // Agrupar por tipo de clase
      const classTypeStats = {};
      enrollments.forEach(enrollment => {
        const classType = enrollment.class.type;
        if (!classTypeStats[classType]) {
          classTypeStats[classType] = {
            enrolled: 0,
            completed: 0
          };
        }
        classTypeStats[classType].enrolled++;
        if (enrollment.attendanceDate) {
          classTypeStats[classType].completed++;
        }
      });

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email
          },
          progress: {
            totalEnrollments,
            completedClasses,
            completionRate,
            classTypeBreakdown: Object.keys(classTypeStats).map(type => ({
              type,
              enrolled: classTypeStats[type].enrolled,
              completed: classTypeStats[type].completed,
              completionRate: Math.round((classTypeStats[type].completed / classTypeStats[type].enrolled) * 100)
            })),
            recentActivity: enrollments.slice(0, 10).map(e => ({
              className: e.class.name,
              enrollmentDate: e.enrollmentDate,
              attendanceDate: e.attendanceDate,
              status: e.status
            }))
          }
        }
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error obteniendo progreso del usuario: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getMonthlyReport(year: number, month: number) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const classes = await this.classRepository.find({
        where: {
          startTime: Between(startDate, endDate)
        },
        relations: ['coach', 'enrollments']
      });

      const dailyStats = {};
      const coachStats = {};

      classes.forEach(cls => {
        const day = cls.startTime.getDate();
        const coachId = cls.coachId;
        const coachName = cls.coach ? `${cls.coach.firstName} ${cls.coach.lastName}` : 'Sin coach';

        // Stats diarios
        if (!dailyStats[day]) {
          dailyStats[day] = {
            date: day,
            classes: 0,
            enrollments: 0,
            revenue: 0
          };
        }
        dailyStats[day].classes++;
        dailyStats[day].enrollments += cls.currentEnrollments;
        dailyStats[day].revenue += cls.price * cls.currentEnrollments;

        // Stats por coach
        if (!coachStats[coachId]) {
          coachStats[coachId] = {
            coachName,
            classes: 0,
            enrollments: 0,
            revenue: 0
          };
        }
        coachStats[coachId].classes++;
        coachStats[coachId].enrollments += cls.currentEnrollments;
        coachStats[coachId].revenue += cls.price * cls.currentEnrollments;
      });

      return {
        success: true,
        data: {
          period: { year, month },
          totalClasses: classes.length,
          totalEnrollments: classes.reduce((sum, cls) => sum + cls.currentEnrollments, 0),
          totalRevenue: classes.reduce((sum, cls) => sum + (cls.price * cls.currentEnrollments), 0),
          dailyStats: Object.values(dailyStats),
          coachStats: Object.values(coachStats)
        }
      };
    } catch (error) {
      throw new HttpException(
        `Error generando reporte mensual: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getEnrollmentTrends(startDate: Date, endDate: Date) {
    try {
      const enrollments = await this.enrollmentRepository.find({
        where: {
          enrollmentDate: Between(startDate, endDate)
        },
        relations: ['class', 'user']
      });

      const dailyEnrollments = {};
      const classTypeStats = {};

      enrollments.forEach(enrollment => {
        const day = enrollment.enrollmentDate.toISOString().split('T')[0];
        const classType = enrollment.class.type;

        // Inscripciones por día
        if (!dailyEnrollments[day]) {
          dailyEnrollments[day] = 0;
        }
        dailyEnrollments[day]++;

        // Stats por tipo de clase
        if (!classTypeStats[classType]) {
          classTypeStats[classType] = 0;
        }
        classTypeStats[classType]++;
      });

      return {
        success: true,
        data: {
          totalEnrollments: enrollments.length,
          dailyTrends: Object.keys(dailyEnrollments).map(date => ({
            date,
            enrollments: dailyEnrollments[date]
          })),
          classTypeDistribution: Object.keys(classTypeStats).map(type => ({
            type,
            enrollments: classTypeStats[type],
            percentage: enrollments.length > 0 ? Math.round((classTypeStats[type] / enrollments.length) * 100) : 0
          }))
        }
      };
    } catch (error) {
      throw new HttpException(
        `Error obteniendo tendencias de inscripciones: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}