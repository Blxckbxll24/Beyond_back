import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrService } from './qr.service';
import { QrController } from './qr.controller';
import { User } from '../user/entities/user.entity';
import { ClassEnrollment } from '../classes/entities/class-enrollment.entity';
import { Class } from '../classes/entities/class.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ClassEnrollment, Class])],
  controllers: [QrController],
  providers: [QrService],
  exports: [QrService],
})
export class QrModule {}