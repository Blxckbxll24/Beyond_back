import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva cita' })
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las citas' })
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una cita por ID' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una cita' })
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(+id, updateAppointmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar una cita' })
  cancel(@Param('id') id: string) {
    return this.appointmentsService.cancel(+id);
  }

  @Get('specialist/:specialistId')
  @ApiOperation({ summary: 'Obtener citas por especialista' })
  findBySpecialist(
    @Param('specialistId') specialistId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.appointmentsService.findBySpecialist(
      +specialistId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirmar una cita' })
  confirm(@Param('id') id: string) {
    return this.appointmentsService.confirmAppointment(+id);
  }

  @Patch(':id/notes')
  @ApiOperation({ summary: 'Agregar notas a una cita' })
  addNotes(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @Body('isSpecialistNote') isSpecialistNote: boolean = false
  ) {
    return this.appointmentsService.addNotes(+id, notes, isSpecialistNote);
  }
}