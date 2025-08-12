import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, MinLength, IsBoolean, IsDateString } from 'class-validator';
import { UserType } from '../entities/user.entity';


export class CreateUserDto {
    @ApiProperty()
    @IsString()
    username: string;


    @ApiProperty()
    @IsEmail()
    email: string;


    @ApiProperty()
    @IsString()
    @MinLength(6)
    password: string;


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
        default: UserType.CLIENT,
        description: 'Tipo de usuario',
        example: UserType.CLIENT
    })
    @IsOptional()
    @IsEnum(UserType)
    userType?: UserType;


    // ✅ AGREGAR: Propiedades adicionales para el admin dashboard
    @ApiProperty({ 
        required: false,
        description: 'Fecha de nacimiento del usuario',
        example: '1990-01-01'
    })
    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;


    @ApiProperty({ 
        required: false,
        description: 'Rol del usuario (alias para userType)',
        example: 'client'
    })
    @IsOptional()
    @IsString()
    role?: string;


    @ApiProperty({ 
        required: false,
        default: true,
        description: 'Si el usuario está activo'
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;


    @ApiProperty({ 
        required: false,
        description: 'Código QR del usuario'
    })
    @IsOptional()
    @IsString()
    qrCode?: string;


    @ApiProperty({ 
        required: false,
        default: false,
        description: 'Si el QR está activo'
    })
    @IsOptional()
    @IsBoolean()
    qrActive?: boolean;
}
