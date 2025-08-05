import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsOptional, IsString, IsPositive } from 'class-validator';
import { PaymentType } from '../entities/payment.entity';

export class CreatePaymentDto {
    @ApiProperty()
    @IsNumber()
    userId: number;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    amount: number;

    @ApiProperty({ enum: PaymentType })
    @IsEnum(PaymentType)
    type: PaymentType;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    referenceId?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}