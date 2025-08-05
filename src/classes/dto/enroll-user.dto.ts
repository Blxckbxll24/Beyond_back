import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class EnrollUserDto {
  @ApiProperty({ description: 'ID del usuario a inscribir' })
  @IsNumber()
  userId: number;

  @ApiProperty({ required: false, description: 'Notas adicionales' })
  @IsOptional()
  @IsString()
  notes?: string;
}