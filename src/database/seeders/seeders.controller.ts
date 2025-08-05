import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DatabaseSeeder } from './database.seeder';

@ApiTags('database')
@Controller('database')
export class SeedersController {
  constructor(private readonly databaseSeeder: DatabaseSeeder) {}

  @Post('seed')
  @ApiOperation({ summary: 'Ejecutar seed de la base de datos' })
  async runSeed() {
    await this.databaseSeeder.run();
    return {
      success: true,
      message: 'Seed ejecutado correctamente'
    };
  }
}