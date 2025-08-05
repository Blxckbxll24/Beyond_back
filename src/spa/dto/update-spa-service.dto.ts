import { PartialType } from '@nestjs/swagger';
import { CreateSpaServiceDto } from './create-spa-service.dto';

export class UpdateSpaServiceDto extends PartialType(CreateSpaServiceDto) {}