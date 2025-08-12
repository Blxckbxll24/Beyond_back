import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { Class } from './entities/class.entity';
import { ClassEnrollment } from './entities/class-enrollment.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Class,           // ✅ Entidad Class
      ClassEnrollment, // ✅ Entidad ClassEnrollment
      User             // ✅ Entidad User
    ])
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService] // ✅ Exportar el servicio para usar en otros módulos
})
export class ClassesModule {}