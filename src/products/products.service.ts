
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      
      return {
        success: true,
        message: 'Producto creado correctamente',
        data: product
      };
    } catch (error) {
      throw new HttpException(
        `Error al crear el producto: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async findAll() {
    try {
      const products = await this.productRepository.find({
        where: { isActive: true },
        order: { name: 'ASC' }
      });
      
      return {
        success: true,
        data: products,
        count: products.length
      };
    } catch (error) {
      throw new HttpException(
        `Error al obtener los productos: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: number) {
    try {
      const product = await this.productRepository.findOne({
        where: { id, isActive: true }
      });

      if (!product) {
        throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: product
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al obtener el producto: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
      
      if (!product) {
        throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
      }

      await this.productRepository.update(id, updateProductDto);
      const updatedProduct = await this.productRepository.findOne({ where: { id } });

      return {
        success: true,
        message: 'Producto actualizado correctamente',
        data: updatedProduct
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al actualizar el producto: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async remove(id: number) {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
      
      if (!product) {
        throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
      }

      await this.productRepository.update(id, { isActive: false });

      return {
        success: true,
        message: 'Producto eliminado correctamente'
      };
    } catch (error) {
      throw new HttpException(
        `Error al eliminar el producto: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async updateStock(id: number, quantity: number, operation: 'add' | 'subtract') {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
      
      if (!product) {
        throw new HttpException('Producto no encontrado', HttpStatus.NOT_FOUND);
      }

      const newStock = operation === 'add' 
        ? product.stock + quantity
        : product.stock - quantity;

      if (newStock < 0) {
        throw new HttpException('Stock insuficiente', HttpStatus.BAD_REQUEST);
      }

      await this.productRepository.update(id, { stock: newStock });

      return {
        success: true,
        message: 'Stock actualizado correctamente',
        data: { previousStock: product.stock, newStock }
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error al actualizar stock: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async getLowStockProducts(threshold: number = 10) {
    try {
      const products = await this.productRepository
        .createQueryBuilder('product')
        .where('product.stock <= :threshold AND product.isActive = true', { threshold })
        .getMany();
      
      return {
        success: true,
        data: products,
        count: products.length
      };
    } catch (error) {
      throw new HttpException(
        `Error al obtener productos con stock bajo: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}