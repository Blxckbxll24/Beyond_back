import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateSpaBookingDto {
    @ApiProperty()
    @IsNumber()
    clientId: number;

    @ApiProperty()
    @IsNumber()
    serviceId: number;

    @ApiProperty()
    @IsDateString()
    scheduledDate: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}