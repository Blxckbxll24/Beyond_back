import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
    @ApiProperty()
    @IsNumber()
    userId: number;

    @ApiProperty({ enum: NotificationType })
    @IsEnum(NotificationType)
    type: NotificationType;

    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    message: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    relatedId?: number;
}