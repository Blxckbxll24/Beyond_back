import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';


export class CreateUserDto {
    @ApiProperty()
    @IsString()
    username: string;
    @ApiProperty()
    @IsEmail()
    email: string;
    @ApiProperty()
    @IsString()
    password: string;
    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
