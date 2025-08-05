import { ApiProperty } from '@nestjs/swagger';

export class QrUserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

export class QrUserWithCodeDto extends QrUserDto {
  @ApiProperty()
  qrCode: string;
}

export class BaseResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message?: string;
}