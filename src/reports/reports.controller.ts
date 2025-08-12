import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('classes')
  @ApiOperation({ summary: 'Obtener reporte de clases' })
  @ApiResponse({ status: 200, description: 'Reporte obtenido correctamente' })
  getClassesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    // ✅ CORREGIR: usar getClassAttendanceReport en lugar de getClassesReport
    return this.reportsService.getClassAttendanceReport(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('coaches/:coachId/performance')
  @ApiOperation({ summary: 'Obtener reporte de performance del coach' })
  @ApiResponse({ status: 200, description: 'Reporte obtenido correctamente' })
  getCoachPerformanceReport(
    @Param('coachId') coachId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // ✅ CORREGIR: usar getCoachPerformance en lugar de getCoachPerformanceReport
    return this.reportsService.getCoachPerformance(
      +coachId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('users/:userId/progress')
  @ApiOperation({ summary: 'Obtener reporte de progreso del usuario' })
  @ApiResponse({ status: 200, description: 'Reporte obtenido correctamente' })
  getUserProgressReport(@Param('userId') userId: string) {
    // ✅ CREAR: método que no existe - por ahora devolver error o implementar
    return this.reportsService.getUserProgress(+userId);
  }

  @Get('financial')
  @ApiOperation({ summary: 'Obtener reporte financiero' })
  @ApiResponse({ status: 200, description: 'Reporte obtenido correctamente' })
  getFinancialReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    // ✅ CREAR: método que no existe - por ahora usar getMonthlyReport
    const start = new Date(startDate);
    return this.reportsService.getMonthlyReport(start.getFullYear(), start.getMonth() + 1);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Obtener reporte mensual' })
  @ApiResponse({ status: 200, description: 'Reporte obtenido correctamente' })
  getMonthlyReport(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.reportsService.getMonthlyReport(+year, +month);
  }

  @Get('enrollment-trends')
  @ApiOperation({ summary: 'Obtener tendencias de inscripciones' })
  @ApiResponse({ status: 200, description: 'Reporte obtenido correctamente' })
  getEnrollmentTrends(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getEnrollmentTrends(
      new Date(startDate),
      new Date(endDate),
    );
  }
}