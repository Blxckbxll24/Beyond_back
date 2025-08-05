import { Injectable } from '@nestjs/common';
import { RolesSeeder } from './roles.seeder';
import { AdminSeeder } from './admin.seeder';
import { CoachesSeeder } from './coaches.seeder';
import { ClassesSeeder } from './classes.seeder';

@Injectable()
export class DatabaseSeeder {
  constructor(
    private rolesSeeder: RolesSeeder,
    private adminSeeder: AdminSeeder,
    private coachesSeeder: CoachesSeeder,
    private classesSeeder: ClassesSeeder,
  ) {}

  async run() {
    console.log('🚀 Iniciando seed de la base de datos...');
    
    try {
      // Ejecutar seeders en orden
      await this.rolesSeeder.seed();
      await this.adminSeeder.seed();
      await this.coachesSeeder.seed();
      await this.classesSeeder.seed();
      
      console.log('✅ Seed completado exitosamente!');
    } catch (error) {
      console.error('❌ Error durante el seed:', error);
      throw error;
    }
  }
}