import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  // ✅ Crear nueva clase
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createClassDto: CreateClassDto, @Request() req) {
    console.log('📝 Creando nueva clase:', createClassDto);
    return this.classesService.create(createClassDto, req.user);
  }

  // ✅ Obtener todas las clases (admin)
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    console.log('📚 Obteniendo todas las clases');
    return this.classesService.findAll();
  }

  // ✅ Obtener clases disponibles para reservar
  @Get('available')
  async getAvailableClasses(@Query() filters: any) {
    console.log('🎯 Obteniendo clases disponibles:', filters);
    return this.classesService.getAvailableClasses(filters);
  }

  // ✅ Obtener mis clases reservadas - MÉTODO CORREGIDO
  @Get('my-classes')
  @UseGuards(JwtAuthGuard)
  async getMyClasses(@Request() req, @Query() filters: any) {
    console.log(`📚 Obteniendo clases del usuario ${req.user.id}:`, filters);
    return this.classesService.getUserClasses(req.user.id, filters);
  }

  // ✅ Obtener clases del coach
  @Get('coach/my-classes')
  @UseGuards(JwtAuthGuard)
  async getCoachClasses(@Request() req, @Query() filters: any) {
    console.log(`👨‍🏫 Obteniendo clases del coach ${req.user.id}:`, filters);
    return this.classesService.getCoachClasses(req.user.id, filters);
  }

  // ✅ Obtener clases por rango de fechas
  @Get('date-range')
  @UseGuards(JwtAuthGuard)
  async getClassesByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    if (!startDate || !endDate) {
      throw new HttpException('startDate y endDate son requeridos', HttpStatus.BAD_REQUEST);
    }
    console.log(`📅 Obteniendo clases desde ${startDate} hasta ${endDate}`);
    return this.classesService.findByDateRange(new Date(startDate), new Date(endDate));
  }

  // ✅ Obtener una clase específica
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    console.log(`🔍 Obteniendo clase ${id}`);
    return this.classesService.findOne(+id);
  }

  // ✅ Actualizar clase
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto, @Request() req) {
    console.log(`📝 Actualizando clase ${id}:`, updateClassDto);
    return this.classesService.update(+id, updateClassDto, req.user);
  }

  // ✅ Eliminar clase
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req) {
    console.log(`🗑️ Eliminando clase ${id}`);
    return this.classesService.remove(+id, req.user);
  }

  // ✅ INSCRIBIRSE A UNA CLASE
  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  async enrollInClass(@Param('id') id: string, @Request() req) {
    console.log(`📝 Usuario ${req.user.id} inscribiéndose a clase ${id}`);
    return this.classesService.enrollInClass(+id, req.user.id);
  }

  // ✅ CANCELAR INSCRIPCIÓN
  @Delete(':id/enroll')
  @UseGuards(JwtAuthGuard)
  async cancelEnrollment(@Param('id') id: string, @Request() req) {
    console.log(`❌ Usuario ${req.user.id} cancelando inscripción a clase ${id}`);
    return this.classesService.cancelEnrollment(+id, req.user.id);
  }
}