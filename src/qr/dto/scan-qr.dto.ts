import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString } from 'class-validator';

export class ScanQrDto {
  @ApiProperty({ description: 'ID del usuario' })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'Código QR único del usuario' })
  @IsString()
  qrCode: string;

  @ApiProperty({ description: 'Tipo de QR' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Timestamp del QR' })
  @IsDateString()
  timestamp: string;
}