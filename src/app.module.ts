import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Modules
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RolesModule } from './roles/roles.module';
import { ClassesModule } from './classes/classes.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ProductsModule } from './products/products.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { SpaModule } from './spa/spa.module';
import { SeedersModule } from './database/seeders/seeders.module';
import { QrModule } from './qr/qr.module';
import { CoachModule } from './coach/coach.module';

// Main App
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Entities
import { User } from './user/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { Class } from './classes/entities/class.entity';
import { ClassEnrollment } from './classes/entities/class-enrollment.entity';
import { Appointment } from './appointments/entities/appointment.entity';
import { Product } from './products/entities/product.entity';
import { Payment } from './payments/entities/payment.entity';
import { Notification } from './notifications/entities/notification.entity';
import { Package } from './packages/entities/package.entity';
import { UserPackage } from './packages/entities/user-package.entity';
import { SpaService } from './spa/entities/spa-service.entity';
import { SpaBooking } from './spa/entities/spa-booking.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Especifica explícitamente el archivo .env
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USER', 'root'),
        password: configService.get('DB_PASSWORD', 'root'),
        database: configService.get('DB_NAME', 'beyond'),
        entities: [
          User,
          Role,
          Class,
          ClassEnrollment,
          Appointment,
          Product,
          Payment,
          Notification,
          Package,
          UserPackage,
          SpaService,
          SpaBooking
        ],
        synchronize: true, // Solo para desarrollo
        logging: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    RolesModule,
    ClassesModule,
    AppointmentsModule,
    ProductsModule,
    PaymentsModule,
    NotificationsModule,
    ReportsModule,
    SpaModule,
    SeedersModule,
    QrModule,
    CoachModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
