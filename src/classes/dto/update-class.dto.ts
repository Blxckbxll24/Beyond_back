import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateClassDto } from './create-class.dto';

export class UpdateClassDto extends PartialType(CreateClassDto) {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  capacity?: number; // ✅ Usar capacity consistentemente

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(240)
  duration?: number; // ✅ Asegurar validación de duración
}