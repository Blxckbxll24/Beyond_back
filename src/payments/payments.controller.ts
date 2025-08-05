
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Procesar un pago' })
  processPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.processPayment(createPaymentDto);
  }

  @Get('user/:userId/history')
  @ApiOperation({ summary: 'Obtener historial de pagos del usuario' })
  getPaymentHistory(@Param('userId') userId: string) {
    return this.paymentsService.getPaymentHistory(+userId);
  }

  @Get('reports/revenue')
  @ApiOperation({ summary: 'Reporte de ingresos' })
  getRevenueReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.paymentsService.getRevenueReport(
      new Date(startDate),
      new Date(endDate)
    );
  }
}