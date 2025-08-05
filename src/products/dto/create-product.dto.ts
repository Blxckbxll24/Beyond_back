import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsPositive, IsUrl } from 'class-validator';
import { ProductCategory } from '../entities/product.entity';

export class CreateProductDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ enum: ProductCategory })
    @IsEnum(ProductCategory)
    category: ProductCategory;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    price: number;

    @ApiProperty({ default: 0 })
    @IsOptional()
    @IsNumber()
    stock?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUrl()
    imageUrl?: string;
}