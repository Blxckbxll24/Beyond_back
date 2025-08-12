import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachController } from './coach.controller';
import { CoachService } from './coach.service';
import { Class } from '../classes/entities/class.entity';
import { ClassEnrollment } from '../classes/entities/class-enrollment.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Class, ClassEnrollment, User])
  ],
  controllers: [CoachController],
  providers: [CoachService],
  exports: [CoachService]
})
export class CoachModule {}