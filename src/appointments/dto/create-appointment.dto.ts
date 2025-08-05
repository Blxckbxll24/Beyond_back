import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDateString, IsEnum, IsOptional, IsString, IsPositive } from 'class-validator';
import { AppointmentType } from '../entities/appointment.entity';

export class CreateAppointmentDto {
    @ApiProperty()
    @IsNumber()
    clientId: number;

    @ApiProperty()
    @IsNumber()
    specialistId: number;

    @ApiProperty({ enum: AppointmentType })
    @IsEnum(AppointmentType)
    type: AppointmentType;

    @ApiProperty()
    @IsDateString()
    scheduledDate: string;

    @ApiProperty({ default: 60 })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    duration?: number;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    price: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}