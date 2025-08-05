import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SpaService } from './spa.service';
import { CreateSpaServiceDto } from './dto/create-spa-service.dto';
import { UpdateSpaServiceDto } from './dto/update-spa-service.dto';
import { CreateSpaBookingDto } from './dto/create-spa-booking.dto';

@ApiTags('spa')
@Controller('spa')
export class SpaController {
  constructor(private readonly spaService: SpaService) {}

  // SERVICIOS SPA
  @Post('services')
  @ApiOperation({ summary: 'Crear un nuevo servicio de spa' })
  createService(@Body() createSpaServiceDto: CreateSpaServiceDto) {
    return this.spaService.createService(createSpaServiceDto);
  }

  @Get('services')
  @ApiOperation({ summary: 'Obtener todos los servicios de spa' })
  findAllServices() {
    return this.spaService.findAllServices();
  }

  @Get('services/:id')
  @ApiOperation({ summary: 'Obtener un servicio de spa por ID' })
  findOneService(@Param('id') id: string) {
    return this.spaService.findOneService(+id);
  }

  @Patch('services/:id')
  @ApiOperation({ summary: 'Actualizar un servicio de spa' })
  updateService(@Param('id') id: string, @Body() updateSpaServiceDto: UpdateSpaServiceDto) {
    return this.spaService.updateService(+id, updateSpaServiceDto);
  }

  @Delete('services/:id')
  @ApiOperation({ summary: 'Eliminar un servicio de spa' })
  removeService(@Param('id') id: string) {
    return this.spaService.removeService(+id);
  }

  // RESERVAS SPA
  @Post('bookings')
  @ApiOperation({ summary: 'Crear una nueva reserva de spa' })
  createBooking(@Body() createSpaBookingDto: CreateSpaBookingDto) {
    return this.spaService.createBooking(createSpaBookingDto);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Obtener todas las reservas de spa' })
  findAllBookings() {
    return this.spaService.findAllBookings();
  }

  @Get('bookings/calendar')
  @ApiOperation({ summary: 'Obtener reservas por rango de fechas' })
  getBookingsCalendar(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.spaService.findBookingsByDateRange(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('bookings/:id')
  @ApiOperation({ summary: 'Obtener una reserva de spa por ID' })
  findOneBooking(@Param('id') id: string) {
    return this.spaService.findOneBooking(+id);
  }

  @Patch('bookings/:id/confirm')
  @ApiOperation({ summary: 'Confirmar una reserva de spa' })
  confirmBooking(@Param('id') id: string) {
    return this.spaService.confirmBooking(+id);
  }

  @Patch('bookings/:id/cancel')
  @ApiOperation({ summary: 'Cancelar una reserva de spa' })
  cancelBooking(@Param('id') id: string) {
    return this.spaService.cancelBooking(+id);
  }

  @Get('bookings/client/:clientId')
  @ApiOperation({ summary: 'Obtener reservas por cliente' })
  findBookingsByClient(@Param('clientId') clientId: string) {
    return this.spaService.findBookingsByClient(+clientId);
  }
}