import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsArray, IsBoolean } from "class-validator";

export class CreateRoleDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false, type: [String] })
    @IsOptional()
    @IsArray()
    permissions?: string[];

    @ApiProperty({ required: false, default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
