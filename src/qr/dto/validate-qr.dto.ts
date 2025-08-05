import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ValidateQrDto {
  @ApiProperty({ description: 'Código QR del usuario' })
  @IsString()
  qrCode: string;
}