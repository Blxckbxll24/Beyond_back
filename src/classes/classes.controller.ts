import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { EnrollUserDto } from './dto/enroll-user.dto';

@ApiTags('classes')
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva clase' })
  @ApiResponse({ status: 201, description: 'Clase creada correctamente' })
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las clases' })
  @ApiResponse({ status: 200, description: 'Lista de clases' })
  findAll() {
    return this.classesService.findAll();
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Obtener clases por rango de fechas' })
  @ApiQuery({ name: 'startDate', type: String })
  @ApiQuery({ name: 'endDate', type: String })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.classesService.findByDateRange(new Date(startDate), new Date(endDate));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una clase por ID' })
  @ApiResponse({ status: 200, description: 'Clase encontrada' })
  @ApiResponse({ status: 404, description: 'Clase no encontrada' })
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una clase' })
  @ApiResponse({ status: 200, description: 'Clase actualizada correctamente' })
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classesService.update(+id, updateClassDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una clase' })
  @ApiResponse({ status: 200, description: 'Clase eliminada correctamente' })
  remove(@Param('id') id: string) {
    return this.classesService.remove(+id);
  }

  @Post(':id/enroll')
  @ApiOperation({ summary: 'Inscribir usuario a una clase' })
  @ApiResponse({ status: 201, description: 'Usuario inscrito correctamente' })
  @ApiResponse({ status: 404, description: 'Clase o usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'Usuario ya inscrito o clase llena' })
  enrollUser(
    @Param('id') classId: string,
    @Body() enrollUserDto: EnrollUserDto
  ) {
    return this.classesService.enrollUser(+classId, enrollUserDto.userId, enrollUserDto.notes);
  }

  @Patch('enrollment/:id/attendance')
  @ApiOperation({ summary: 'Marcar asistencia' })
  @ApiResponse({ status: 200, description: 'Asistencia marcada correctamente' })
  markAttendance(@Param('id') enrollmentId: string) {
    return this.classesService.markAttendance(+enrollmentId);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Obtener estadísticas de una clase' })
  @ApiResponse({ status: 200, description: 'Estadísticas de la clase' })
  getStatistics(@Param('id') id: string) {
    return this.classesService.getClassStatistics(+id);
  }

  @Get('coach/:coachId')
  @ApiOperation({ summary: 'Obtener clases por coach' })
  @ApiResponse({ status: 200, description: 'Clases del coach' })
  findByCoach(@Param('coachId') coachId: string) {
    return this.classesService.findByCoach(+coachId);
  }
}