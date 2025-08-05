import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una notificación' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener notificaciones del usuario' })
  findByUser(
    @Param('userId') userId: string,
    @Query('unreadOnly') unreadOnly?: boolean
  ) {
    return this.notificationsService.findByUser(+userId, unreadOnly);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(+id);
  }

  @Post('class/:classId/reminder')
  @ApiOperation({ summary: 'Enviar recordatorio de clase' })
  sendClassReminder(@Param('classId') classId: string) {
    return this.notificationsService.sendClassReminder(+classId);
  }

  @Post('appointment/:appointmentId/reminder')
  @ApiOperation({ summary: 'Enviar recordatorio de cita' })
  sendAppointmentReminder(@Param('appointmentId') appointmentId: string) {
    return this.notificationsService.sendAppointmentReminder(+appointmentId);
  }

  @Post('promotional')
  @ApiOperation({ summary: 'Enviar notificación promocional' })
  sendPromotional(
    @Body('userIds') userIds: number[],
    @Body('title') title: string,
    @Body('message') message: string
  ) {
    return this.notificationsService.sendPromotionalNotification(userIds, title, message);
  }
}