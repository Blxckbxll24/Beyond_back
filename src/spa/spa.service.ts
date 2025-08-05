import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SpaService as SpaServiceEntity } from './entities/spa-service.entity';
import { SpaBooking, SpaBookingStatus } from './entities/spa-booking.entity';
import { CreateSpaServiceDto } from './dto/create-spa-service.dto';
import { UpdateSpaServiceDto } from './dto/update-spa-service.dto';
import { CreateSpaBookingDto } from './dto/create-spa-booking.dto';

@Injectable()
export class SpaService {
  constructor(
    @InjectRepository(SpaServiceEntity) private spaServiceRepository: Repository<SpaServiceEntity>,
    @InjectRepository(SpaBooking) private spaBookingRepository: Repository<SpaBooking>,
  ) {}

  // GESTIÓN DE SERVICIOS SPA
  async createService(createSpaServiceDto: CreateSpaServiceDto) {
    try {
      const service = this.spaServiceRepository.create(createSpaServiceDto);
      await this.spaServiceRepository.save(service);
      
      return {
        success: true,
        message: 'Servicio de spa creado correctamente',
        data: service
      };
    } catch (error) {
      throw new HttpException(
        `Error al crear el servicio: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async findAllServices() {
    try {
      const services = await this.spaServiceRepository.find({
        where: { isActive: true },
        order: { name: 'ASC' }
      });
      
      return {
        success: true,
        data: services,
        count: services.length
      };
    } catch (error) {
      throw new HttpException(
        `Error al obtener los servicios: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOneService(id: number) {
    try {
      const service = await this.spaServiceRepository.findOne({
        where: { id, isActive: true },
        relations: ['bookings']
      });

      if (!service) {
        throw new HttpException('Servicio no encontrado', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: service
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al obtener el servicio: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateService(id: number, updateSpaServiceDto: UpdateSpaServiceDto) {
    try {
      const service = await this.spaServiceRepository.findOne({ where: { id } });
      
      if (!service) {
        throw new HttpException('Servicio no encontrado', HttpStatus.NOT_FOUND);
      }

      await this.spaServiceRepository.update(id, updateSpaServiceDto);
      const updatedService = await this.spaServiceRepository.findOne({ where: { id } });

      return {
        success: true,
        message: 'Servicio actualizado correctamente',
        data: updatedService
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al actualizar el servicio: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async removeService(id: number) {
    try {
      const service = await this.spaServiceRepository.findOne({
        where: { id },
        relations: ['bookings']
      });

      if (!service) {
        throw new HttpException('Servicio no encontrado', HttpStatus.NOT_FOUND);
      }

      // Verificar si hay reservas activas
      const activeBookings = service.bookings?.filter(
        booking => booking.status === SpaBookingStatus.SCHEDULED || booking.status === SpaBookingStatus.CONFIRMED
      );

      if (activeBookings && activeBookings.length > 0) {
        throw new HttpException(
          'No se puede eliminar el servicio porque tiene reservas activas',
          HttpStatus.CONFLICT
        );
      }

      await this.spaServiceRepository.update(id, { isActive: false });

      return {
        success: true,
        message: 'Servicio eliminado correctamente'
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al eliminar el servicio: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // GESTIÓN DE RESERVAS SPA
  async createBooking(createSpaBookingDto: CreateSpaBookingDto) {
    try {
      const service = await this.spaServiceRepository.findOne({
        where: { id: createSpaBookingDto.serviceId }
      });

      if (!service) {
        throw new HttpException('Servicio no encontrado', HttpStatus.NOT_FOUND);
      }

      // Verificar disponibilidad de horario
      const scheduledDate = new Date(createSpaBookingDto.scheduledDate);
      const endTime = new Date(scheduledDate.getTime() + (service.duration * 60000));

      const conflictingBooking = await this.spaBookingRepository.findOne({
        where: {
          serviceId: createSpaBookingDto.serviceId,
          scheduledDate: Between(
            new Date(scheduledDate.getTime() - (service.duration * 60000)),
            endTime
          ),
          status: SpaBookingStatus.CONFIRMED
        }
      });

      if (conflictingBooking) {
        throw new HttpException(
          'El horario no está disponible',
          HttpStatus.CONFLICT
        );
      }

      const booking = this.spaBookingRepository.create(createSpaBookingDto);
      await this.spaBookingRepository.save(booking);
      
      return {
        success: true,
        message: 'Reserva de spa creada correctamente',
        data: booking
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al crear la reserva: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async findAllBookings() {
    try {
      const bookings = await this.spaBookingRepository.find({
        relations: ['client', 'service'],
        order: { scheduledDate: 'ASC' }
      });
      
      return {
        success: true,
        data: bookings,
        count: bookings.length
      };
    } catch (error) {
      throw new HttpException(
        `Error al obtener las reservas: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOneBooking(id: number) {
    try {
      const booking = await this.spaBookingRepository.findOne({
        where: { id },
        relations: ['client', 'service']
      });

      if (!booking) {
        throw new HttpException('Reserva no encontrada', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: booking
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al obtener la reserva: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async confirmBooking(id: number) {
    try {
      const booking = await this.spaBookingRepository.findOne({ where: { id } });
      
      if (!booking) {
        throw new HttpException('Reserva no encontrada', HttpStatus.NOT_FOUND);
      }

      await this.spaBookingRepository.update(id, {
        status: SpaBookingStatus.CONFIRMED
      });

      return {
        success: true,
        message: 'Reserva confirmada correctamente'
      };
    } catch (error) {
      throw new HttpException(
        `Error al confirmar la reserva: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async cancelBooking(id: number) {
    try {
      const booking = await this.spaBookingRepository.findOne({ where: { id } });
      
      if (!booking) {
        throw new HttpException('Reserva no encontrada', HttpStatus.NOT_FOUND);
      }

      await this.spaBookingRepository.update(id, {
        status: SpaBookingStatus.CANCELLED
      });

      return {
        success: true,
        message: 'Reserva cancelada correctamente'
      };
    } catch (error) {
      throw new HttpException(
        `Error al cancelar la reserva: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async findBookingsByClient(clientId: number) {
    try {
      const bookings = await this.spaBookingRepository.find({
        where: { clientId },
        relations: ['service'],
        order: { scheduledDate: 'DESC' }
      });
      
      return {
        success: true,
        data: bookings,
        count: bookings.length
      };
    } catch (error) {
      throw new HttpException(
        `Error al obtener las reservas del cliente: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findBookingsByDateRange(startDate: Date, endDate: Date) {
    try {
      const bookings = await this.spaBookingRepository.find({
        where: {
          scheduledDate: Between(startDate, endDate)
        },
        relations: ['client', 'service'],
        order: { scheduledDate: 'ASC' }
      });
      
      return {
        success: true,
        data: bookings,
        count: bookings.length
      };
    } catch (error) {
      throw new HttpException(
        `Error al obtener las reservas: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}