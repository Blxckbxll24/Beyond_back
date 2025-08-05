import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class AssignRolesDto {
    @ApiProperty({ 
        description: 'Array de IDs de roles a asignar',
        example: [1, 2] 
    })
    @IsArray()
    @IsNumber({}, { each: true })
    roleIds: number[];
}