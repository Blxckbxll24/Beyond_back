import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, MinLength, IsBoolean, IsDateString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { UserType } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ 
        enum: UserType, 
        required: false,
        description: 'Tipo de usuario'
    })
    @IsOptional()
    @IsEnum(UserType)
    userType?: UserType;

    // ✅ AGREGAR: Mismas propiedades adicionales
    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    role?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    qrCode?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    qrActive?: boolean;
}
