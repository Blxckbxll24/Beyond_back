import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment) private appointmentRepository: Repository<Appointment>,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    try {
      const scheduledDate = new Date(createAppointmentDto.scheduledDate);

      if (typeof createAppointmentDto.duration !== 'number') {
        throw new HttpException(
          'La duración de la cita es requerida y debe ser un número',
          HttpStatus.BAD_REQUEST
        );
      }

      const endTime = new Date(scheduledDate.getTime() + (createAppointmentDto.duration * 60000));

      const conflictingAppointment = await this.appointmentRepository.findOne({
        where: {
          specialistId: createAppointmentDto.specialistId,
          scheduledDate: Between(
            new Date(scheduledDate.getTime() - (createAppointmentDto.duration * 60000)),
            endTime
          ),
          status: AppointmentStatus.CONFIRMED
        }
      });

      if (conflictingAppointment) {
        throw new HttpException(
          'El especialista no está disponible en ese horario',
          HttpStatus.CONFLICT
        );
      }

      const appointment = this.appointmentRepository.create(createAppointmentDto);
      await this.appointmentRepository.save(appointment);
      
      return {
        success: true,
        message: 'Cita creada correctamente',
        data: appointment
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al crear la cita: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async findAll() {
    try {
      const appointments = await this.appointmentRepository.find({
        relations: ['client', 'specialist'],
        order: { scheduledDate: 'ASC' }
      });
      
      return {
        success: true,
        data: appointments,
        count: appointments.length
      };
    } catch (error) {
      throw new HttpException(
        `Error al obtener las citas: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: number) {
    try {
      const appointment = await this.appointmentRepository.findOne({
        where: { id },
        relations: ['client', 'specialist']
      });

      if (!appointment) {
        throw new HttpException('Cita no encontrada', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: appointment
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al obtener la cita: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    try {
      const appointment = await this.appointmentRepository.findOne({ where: { id } });
      
      if (!appointment) {
        throw new HttpException('Cita no encontrada', HttpStatus.NOT_FOUND);
      }

      await this.appointmentRepository.update(id, updateAppointmentDto);
      const updatedAppointment = await this.appointmentRepository.findOne({ where: { id } });

      return {
        success: true,
        message: 'Cita actualizada correctamente',
        data: updatedAppointment
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al actualizar la cita: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async cancel(id: number) {
    try {
      const appointment = await this.appointmentRepository.findOne({ where: { id } });
      
      if (!appointment) {
        throw new HttpException('Cita no encontrada', HttpStatus.NOT_FOUND);
      }

      await this.appointmentRepository.update(id, {
        status: AppointmentStatus.CANCELLED
      });

      return {
        success: true,
        message: 'Cita cancelada correctamente'
      };
    } catch (error) {
      throw new HttpException(
        `Error al cancelar la cita: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async findBySpecialist(specialistId: number, startDate?: Date, endDate?: Date) {
    try {
      let whereCondition: any = { specialistId };

      if (startDate && endDate) {
        whereCondition.scheduledDate = Between(startDate, endDate);
      }

      const appointments = await this.appointmentRepository.find({
        where: whereCondition,
        relations: ['client'],
        order: { scheduledDate: 'ASC' }
      });
      
      return {
        success: true,
        data: appointments,
        count: appointments.length
      };
    } catch (error) {
      throw new HttpException(
        `Error al obtener las citas: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async confirmAppointment(id: number) {
    try {
      const appointment = await this.appointmentRepository.findOne({ where: { id } });
      
      if (!appointment) {
        throw new HttpException('Cita no encontrada', HttpStatus.NOT_FOUND);
      }

      await this.appointmentRepository.update(id, {
        status: AppointmentStatus.CONFIRMED
      });

      return {
        success: true,
        message: 'Cita confirmada correctamente'
      };
    } catch (error) {
      throw new HttpException(
        `Error al confirmar la cita: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async addNotes(id: number, notes: string, isSpecialistNote: boolean = false) {
    try {
      const appointment = await this.appointmentRepository.findOne({ where: { id } });
      
      if (!appointment) {
        throw new HttpException('Cita no encontrada', HttpStatus.NOT_FOUND);
      }

      const updateData = isSpecialistNote 
        ? { specialistNotes: notes }
        : { notes };

      await this.appointmentRepository.update(id, updateData);

      return {
        success: true,
        message: 'Notas agregadas correctamente'
      };
    } catch (error) {
      throw new HttpException(
        `Error al agregar notas: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }
}