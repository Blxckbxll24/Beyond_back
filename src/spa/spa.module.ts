import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpaService } from './spa.service';
import { SpaController } from './spa.controller';
import { SpaService as SpaServiceEntity } from './entities/spa-service.entity';
import { SpaBooking } from './entities/spa-booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SpaServiceEntity, SpaBooking])],
  controllers: [SpaController],
  providers: [SpaService],
  exports: [SpaService, TypeOrmModule],
})
export class SpaModule {}