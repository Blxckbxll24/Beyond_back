import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { RolesModule } from './roles/roles.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { parseEnv } from 'node:util';
import { ConfigModule } from '@nestjs/config';
import { Role } from './roles/entities/role.entity';


console.log('process.env.DB_USER', process.env.DB_USER);
console.log('process.env.DB_PASSWORD', process.env.DB_PASSWORD);


@Module({
  imports: [UserModule, RolesModule,
      ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 8888,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Role],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],


})
export class AppModule {}
