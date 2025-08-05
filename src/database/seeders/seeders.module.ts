import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { Role } from '../../roles/entities/role.entity';
import { Class } from '../../classes/entities/class.entity';
import { RolesSeeder } from './roles.seeder';
import { AdminSeeder } from './admin.seeder';
import { CoachesSeeder } from './coaches.seeder';
import { ClassesSeeder } from './classes.seeder';
import { DatabaseSeeder } from './database.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Class])],
  providers: [RolesSeeder, AdminSeeder, CoachesSeeder, ClassesSeeder, DatabaseSeeder],
  exports: [DatabaseSeeder],
})
export class SeedersModule {}