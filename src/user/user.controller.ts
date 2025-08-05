import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado correctamente' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado correctamente' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado correctamente' })
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  // Gestión de roles
  @Post(':id/roles')
  @ApiOperation({ summary: 'Asignar roles a un usuario' })
  @ApiResponse({ status: 200, description: 'Roles asignados correctamente' })
  assignRoles(@Param('id') id: string, @Body() assignRolesDto: AssignRolesDto) {
    return this.userService.assignRoles(+id, assignRolesDto.roleIds);
  }

  @Delete(':id/roles')
  @ApiOperation({ summary: 'Remover roles de un usuario' })
  @ApiResponse({ status: 200, description: 'Roles removidos correctamente' })
  removeRoles(@Param('id') id: string, @Body() assignRolesDto: AssignRolesDto) {
    return this.userService.removeRoles(+id, assignRolesDto.roleIds);
  }

  @Get('coaches/list')
  @ApiOperation({ summary: 'Obtener lista de coaches' })
  @ApiResponse({ status: 200, description: 'Lista de coaches' })
  getCoaches() {
    return this.userService.getCoaches();
  }

  @Get('specialists/list')
  @ApiOperation({ summary: 'Obtener lista de especialistas' })
  @ApiResponse({ status: 200, description: 'Lista de especialistas' })
  getSpecialists() {
    return this.userService.getSpecialists();
  }
}
