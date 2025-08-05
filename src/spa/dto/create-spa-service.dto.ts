import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsPositive } from 'class-validator';
import { SpaServiceCategory } from '../entities/spa-service.entity';

export class CreateSpaServiceDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ enum: SpaServiceCategory })
    @IsEnum(SpaServiceCategory)
    category: SpaServiceCategory;

    @ApiProperty({ default: 60 })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    duration?: number;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    price: number;
}