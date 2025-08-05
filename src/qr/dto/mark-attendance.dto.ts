import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class MarkAttendanceDto {
  @ApiProperty({ description: 'Código QR del usuario' })
  @IsString()
  qrCode: string;

  @ApiProperty({ description: 'ID de la clase' })
  @IsNumber()
  classId: number;

  @ApiProperty({ required: false, description: 'ID del usuario que escaneó el QR (coach/admin)' })
  @IsOptional()
  @IsNumber()
  scannedBy?: number;
}