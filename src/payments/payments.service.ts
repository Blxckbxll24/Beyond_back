import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentType } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
  ) {}

  async processPayment(createPaymentDto: CreatePaymentDto) {
    try {
      const payment = this.paymentRepository.create({
        ...createPaymentDto,
        status: PaymentStatus.PENDING,
        transactionDate: new Date()
      });

      await this.paymentRepository.save(payment);

      // Aquí integrarías con la pasarela de pago real
      // Por ahora simulamos el proceso
      await this.simulatePaymentProcess(payment.id);

      return {
        success: true,
        message: 'Pago procesado correctamente',
        data: payment
      };
    } catch (error) {
      throw new HttpException(
        `Error al procesar el pago: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private async simulatePaymentProcess(paymentId: number) {
    // Simular un delay de procesamiento
    setTimeout(async () => {
      await this.paymentRepository.update(paymentId, {
        status: PaymentStatus.COMPLETED,
        confirmedAt: new Date()
      });
    }, 2000);
  }

  async getPaymentHistory(userId: number) {
    try {
      const payments = await this.paymentRepository.find({
        where: { userId },
        order: { transactionDate: 'DESC' }
      });
      
      return {
        success: true,
        data: payments,
        count: payments.length
      };
    } catch (error) {
      throw new HttpException(
        `Error al obtener historial de pagos: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getRevenueReport(startDate: Date, endDate: Date) {
    try {
      const payments = await this.paymentRepository
        .createQueryBuilder('payment')
        .where('payment.transactionDate BETWEEN :startDate AND :endDate', { startDate, endDate })
        .andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED })
        .getMany();

      const totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      const revenueByType = payments.reduce((acc, payment) => {
        acc[payment.type] = (acc[payment.type] || 0) + Number(payment.amount);
        return acc;
      }, {} as Record<PaymentType, number>);

      return {
        success: true,
        data: {
          totalRevenue,
          revenueByType,
          transactionCount: payments.length,
          payments
        }
      };
    } catch (error) {
      throw new HttpException(
        `Error al generar reporte de ingresos: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}