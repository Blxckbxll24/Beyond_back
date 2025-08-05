import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationStatus } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { User } from '../user/entities/user.entity';
import { Class } from '../classes/entities/class.entity';
import { Appointment } from '../appointments/entities/appointment.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notificationRepository: Repository<Notification>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Class) private classRepository: Repository<Class>,
    @InjectRepository(Appointment) private appointmentRepository: Repository<Appointment>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    try {
      const notification = this.notificationRepository.create(createNotificationDto);
      await this.notificationRepository.save(notification);
      
      return {
        success: true,
        message: 'Notificación creada correctamente',
        data: notification
      };
    } catch (error) {
      throw new HttpException(
        `Error al crear la notificación: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async findByUser(userId: number, unreadOnly: boolean = false) {
    try {
      const whereCondition: any = { userId };
      
      if (unreadOnly) {
        whereCondition.status = NotificationStatus.UNREAD;
      }

      const notifications = await this.notificationRepository.find({
        where: whereCondition,
        order: { createdAt: 'DESC' }
      });
      
      return {
        success: true,
        data: notifications,
        count: notifications.length
      };
    } catch (error) {
      throw new HttpException(
        `Error al obtener notificaciones: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async markAsRead(id: number) {
    try {
      await this.notificationRepository.update(id, {
        status: NotificationStatus.READ,
        readAt: new Date()
      });

      return {
        success: true,
        message: 'Notificación marcada como leída'
      };
    } catch (error) {
      throw new HttpException(
        `Error al marcar notificación: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async sendClassReminder(classId: number) {
    try {
      const classEntity = await this.classRepository.findOne({
        where: { id: classId },
        relations: ['enrollments', 'enrollments.user']
      });

      if (!classEntity) {
        throw new HttpException('Clase no encontrada', HttpStatus.NOT_FOUND);
      }

      const notifications: Notification[] = [];
      
      for (const enrollment of classEntity.enrollments) {
        const notification = await this.notificationRepository.save({
          userId: enrollment.userId,
          type: NotificationType.CLASS_REMINDER,
          title: 'Recordatorio de Clase',
          message: `Tu clase "${classEntity.name}" comienza en 1 hora.`,
          relatedId: classId,
          status: NotificationStatus.UNREAD
        });
        
        notifications.push(notification);
        
        // Aquí podrías integrar envío de email o push notification
        await this.sendEmailNotification(enrollment.user.email, notification);
      }

      return {
        success: true,
        message: `${notifications.length} recordatorios enviados`,
        data: notifications
      };
    } catch (error) {
      throw new HttpException(
        `Error al enviar recordatorios: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async sendAppointmentReminder(appointmentId: number) {
    try {
      const appointment = await this.appointmentRepository.findOne({
        where: { id: appointmentId },
        relations: ['client']
      });

      if (!appointment) {
        throw new HttpException('Cita no encontrada', HttpStatus.NOT_FOUND);
      }

      const notification = await this.notificationRepository.save({
        userId: appointment.clientId,
        type: NotificationType.APPOINTMENT_REMINDER,
        title: 'Recordatorio de Cita',
        message: `Tu cita de ${appointment.type} es mañana a las ${appointment.scheduledDate.toLocaleTimeString()}.`,
        relatedId: appointmentId,
        status: NotificationStatus.UNREAD
      });

      await this.sendEmailNotification(appointment.client.email, notification);

      return {
        success: true,
        message: 'Recordatorio de cita enviado',
        data: notification
      };
    } catch (error) {
      throw new HttpException(
        `Error al enviar recordatorio: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async sendPromotionalNotification(userIds: number[], title: string, message: string) {
    try {
      const notifications: Notification[] = [];
      
      for (const userId of userIds) {
        const notification = await this.notificationRepository.save({
          userId,
          type: NotificationType.PROMOTIONAL,
          title,
          message,
          status: NotificationStatus.UNREAD
        });

        notifications.push(notification);
      }

      return {
        success: true,
        message: `${notifications.length} notificaciones promocionales enviadas`,
        data: notifications
      };
    } catch (error) {
      throw new HttpException(
        `Error al enviar notificaciones promocionales: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private async sendEmailNotification(email: string, notification: Notification) {
    // Aquí integrarías con un servicio de email como SendGrid, Nodemailer, etc.
    console.log(`Enviando email a ${email}:`, {
      subject: notification.title,
      body: notification.message
    });
    
    // Simulación de envío
    return Promise.resolve();
  }
}