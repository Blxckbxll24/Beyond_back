import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsDateString, IsOptional, Min, Max } from 'class-validator';
import { ClassType, ClassLevel } from '../entities/class.entity';

export class CreateClassDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ClassType })
  @IsEnum(ClassType)
  type: ClassType;

  @ApiProperty({ enum: ClassLevel })
  @IsEnum(ClassLevel)
  level: ClassLevel;

  @ApiProperty()
  @IsDateString()
  startTime: string;

  @ApiProperty()
  @IsDateString()
  endTime: string;

  @ApiProperty({ minimum: 1, maximum: 50 })
  @IsNumber()
  @Min(1)
  @Max(50)
  maxCapacity: number;

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  room?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  equipment?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty()
  @IsNumber()
  instructorId: number;
}