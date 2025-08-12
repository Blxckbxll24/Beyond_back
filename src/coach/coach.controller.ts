import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CoachService } from './coach.service';
import { CreateClassDto } from '../classes/dto/create-class.dto';
import { UpdateClassDto } from '../classes/dto/update-class.dto';

@Controller('coach')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('coach')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}
  
  @Get('dashboard/stats')
  async getDashboardStats(@CurrentUser() user: any) {
    console.log('📊 Coach dashboard stats para:', user.username);
    return this.coachService.getDashboardStats(user.id);
  }

  @Get('classes')
  async getMyClasses(@CurrentUser() user: any, @Query() filters: any) {
    console.log('📋 Coach solicitando sus clases:', {
      coachId: user.id,
      username: user.username,
      filters
    });
    
    return this.coachService.getCoachClasses(user.id, filters);
  }

  @Get('classes/today')
  async getTodayClasses(@CurrentUser() user: any) {
    console.log('📅 Coach solicitando clases de hoy:', user.username);
    return this.coachService.getTodayClasses(user.id);
  }

  @Post('classes')
  async createClass(@CurrentUser() user: any, @Body() classData: CreateClassDto) {
    console.log('➕ Coach creando nueva clase:', user.username, classData);
    return this.coachService.createClass(user.id, classData);
  }

  @Patch('classes/:id')
  async updateClass(@CurrentUser() user: any, @Param('id') id: string, @Body() updateData: UpdateClassDto) {
    console.log('✏️ Coach actualizando clase:', user.username, id, updateData);
    return this.coachService.updateClass(+id, user.id, updateData);
  }

  @Delete('classes/:id')
  async deleteClass(@CurrentUser() user: any, @Param('id') id: string) {
    console.log('🗑️ Coach eliminando clase:', user.username, id);
    return this.coachService.deleteClass(+id, user.id);
  }

  @Get('classes/:id')
  async getClassDetails(@CurrentUser() user: any, @Param('id') id: string) {
    console.log('🔍 Coach solicitando detalles de clase:', user.username, id);
    return this.coachService.getClassDetails(+id, user.id);
  }

  @Get('classes/:id/students')
  async getClassStudents(@CurrentUser() user: any, @Param('id') id: string) {
    console.log('👥 Coach solicitando estudiantes de clase:', user.username, id);
    return this.coachService.getClassStudents(+id, user.id);
  }
}