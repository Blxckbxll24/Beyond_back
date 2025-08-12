import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QrService } from './qr.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { ValidateQrDto } from './dto/validate-qr.dto';
import { QrResponseDto } from './dto/qr-response.dto';
import { ValidateQrResponseDto } from './dto/today-classes.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('qr')
@Controller('qr')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Get('generate')
  @ApiOperation({ summary: 'Generar QR para el usuario actual' })
  @ApiResponse({ status: 200, description: 'QR generado correctamente' })
  generateMyQR(@CurrentUser() user: any) {
    return this.qrService.generateUserQR(user.id);
  }

  @Get('generate/:userId')
  @ApiOperation({ summary: 'Generar QR para un usuario específico' })
  @ApiResponse({ status: 200, description: 'QR generado correctamente', type: QrResponseDto })
  generateQR(@Param('userId') userId: string) {
    return this.qrService.generateUserQR(+userId);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validar QR sin marcar asistencia' })
  @ApiResponse({ status: 200, description: 'QR validado', type: ValidateQrResponseDto })
  validateQR(@Body() validateQrDto: ValidateQrDto) {
    return this.qrService.validateQR(validateQrDto.qrCode);
  }

  @Post('attendance')
  @ApiOperation({ summary: 'Marcar asistencia por QR' })
  @ApiResponse({ status: 200, description: 'Asistencia marcada correctamente' })
  markAttendance(@Body() markAttendanceDto: MarkAttendanceDto) {
    return this.qrService.markAttendanceByQR(
      markAttendanceDto.qrCode, 
      markAttendanceDto.classId, 
      markAttendanceDto.scannedBy
    );
  }

  @Post('regenerate/:userId')
  @ApiOperation({ summary: 'Regenerar QR para un usuario' })
  @ApiResponse({ status: 200, description: 'QR regenerado correctamente', type: QrResponseDto })
  regenerateQR(@Param('userId') userId: string) {
    return this.qrService.regenerateUserQR(+userId);
  }
}