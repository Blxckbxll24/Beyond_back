import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentStatus } from '../../classes/entities/class-enrollment.entity';

export class QrUserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

export class TodayClassDto {
  @ApiProperty()
  enrollmentId: number;

  @ApiProperty()
  classId: number;

  @ApiProperty()
  className: string;

  @ApiProperty()
  startTime: Date;

  @ApiProperty({ enum: EnrollmentStatus })
  status: EnrollmentStatus;

  @ApiProperty()
  canMarkAttendance: boolean;
}

// 👈 PRIMERO definir ValidateQrDataDto
export class ValidateQrDataDto {
  @ApiProperty({ type: QrUserDto }) // 👈 SIN función arrow
  user: QrUserDto;

  @ApiProperty({ type: [TodayClassDto] })
  todayClasses: TodayClassDto[];
}

// 👈 DESPUÉS definir ValidateQrResponseDto
export class ValidateQrResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ type: ValidateQrDataDto }) // 👈 SIN función arrow
  data: ValidateQrDataDto;
}