import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private  repo: Repository<User>,
  ) {}
  create(createUserDto: CreateUserDto) {
    const user = this.repo.create(createUserDto)
    this.repo.save(user)
      .then(() => console.log('User created successfully'))
      .catch(err => console.error('Error creating user:', err));
    return  `Se ha agregado un usuario con nombre: ${createUserDto.username}`;
  }

  async findAll() {
    return await this.repo.find();
  }

  findOne(id: number) {
    const user = this.repo.findOneBy({ id });
    if (!user) {
      throw new HttpException(`User with id ${id} not found`, HttpStatus.NOT_FOUND);
    }
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const user = this.repo.findOneBy({ id });
    if (!user) {
      throw new HttpException(`Usuario con ${id} no encontrado`, HttpStatus.NOT_FOUND);
    }
    this.repo.update(id, updateUserDto)
      .then(() => console.log('Usuario actualizado correctamente'))
      .catch(err => console.error('Error Actualizando el usuario', err));
    return "Usuario actualizado correctamente";
  }

  remove(id: number) {
    const user = this.repo.findOneBy({id});
    if(!user){
      throw new HttpException(`Usuario con ${id} no encontrado`, HttpStatus.NOT_FOUND);
    }
    this.repo.delete(id)
    return `Usuario con id ${id} eliminado correctamente`;
  }
}
