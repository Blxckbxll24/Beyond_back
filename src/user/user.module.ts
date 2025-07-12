import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Add your User entity here
  controllers: [UserController],
  providers: [UserService],
  exports: [TypeOrmModule], // Export UserService if needed in other modules
})
export class UserModule {}
