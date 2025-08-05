import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DatabaseSeeder } from './database.seeder';
import { SeedersModule } from './seeders.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  // Importar el módulo de seeders
  const seedersModule = app.select(SeedersModule);
  const seeder = seedersModule.get(DatabaseSeeder);
  
  try {
    await seeder.run();
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();