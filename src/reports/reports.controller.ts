import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('classes')
  @Roles('admin', 'coach')
  @ApiOperation({ summary: 'Reporte de clases' })
  getClassesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.reportsService.getClassesReport(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('coach/:coachId/performance')
  @Roles('admin', 'coach')
  @ApiOperation({ summary: 'Reporte de rendimiento del coach' })
  getCoachPerformance(
    @Param('coachId') coachId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.reportsService.getCoachPerformanceReport(
      +coachId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('user/:userId/progress')
  @Roles('admin', 'coach', 'client')
  @ApiOperation({ summary: 'Reporte de progreso del usuario' })
  getUserProgress(@Param('userId') userId: string) {
    return this.reportsService.getUserProgressReport(+userId);
  }

  @Get('financial')
  @Roles('admin')
  @ApiOperation({ summary: 'Reporte financiero' })
  getFinancialReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.reportsService.getFinancialReport(
      new Date(startDate),
      new Date(endDate)
    );
  }
}