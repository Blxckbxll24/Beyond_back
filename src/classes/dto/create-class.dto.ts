import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsEnum, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ClassType, ClassLevel } from '../entities/class.entity';

export class CreateClassDto {
  @ApiProperty({ description: 'Nombre de la clase' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Descripción de la clase' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Tipo de clase', enum: ClassType })
  @IsEnum(ClassType)
  type: ClassType;

  @ApiPropertyOptional({ description: 'Nivel de la clase', enum: ClassLevel })
  @IsEnum(ClassLevel)
  @IsOptional()
  level?: ClassLevel;

  @ApiProperty({ description: 'Fecha de la clase (YYYY-MM-DD)' })
  @IsDateString()
  date: string; // Fecha en formato YYYY-MM-DD

  @ApiProperty({ description: 'Hora de inicio (HH:MM)' })
  @IsString()
  @IsNotEmpty()
  startTime: string; // Hora en formato HH:MM

  @ApiProperty({ description: 'Hora de fin (HH:MM)' })
  @IsString()
  @IsNotEmpty()
  endTime: string; // Hora en formato HH:MM

  @ApiPropertyOptional({ description: 'Duración en minutos' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(200)
  duration?: number; // Duración en minutos

  @ApiProperty({ description: 'Capacidad máxima' })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  capacity: number; // ✅ Usar 'capacity' en lugar de 'maxEnrollments'

  @ApiPropertyOptional({ description: 'Precio de la clase' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: 'ID del coach' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  coachId?: number;

  @ApiPropertyOptional({ description: 'Equipamiento requerido' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment?: string[];

  @ApiPropertyOptional({ description: 'Notas adicionales' })
  @IsOptional()
  @IsString()
  notes?: string;
}