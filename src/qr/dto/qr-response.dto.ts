import { ApiProperty } from '@nestjs/swagger';

// Definir QrUserWithCodeDto localmente para evitar dependencias circulares
export class QrUserWithCodeDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  qrCode: string;
}

export class QrDataDto {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  qrCode: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  timestamp: string;
}

export class QrGeneratedDataDto {
  @ApiProperty({ type: QrUserWithCodeDto })
  user: QrUserWithCodeDto;

  @ApiProperty({ description: 'Imagen QR en formato base64' })
  qrImage: string;

  @ApiProperty({ type: QrDataDto })
  qrData: QrDataDto;
}

export class QrResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: QrGeneratedDataDto })
  data: QrGeneratedDataDto;
}