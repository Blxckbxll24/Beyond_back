import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, MinLength } from 'class-validator';
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
}
