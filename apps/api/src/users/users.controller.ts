import {
  Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminKeyGuard } from '../ingredients/admin-key.guard';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiHeader({ name: 'x-admin-key', required: true })
@UseGuards(AdminKeyGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Xem danh sách user' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một user' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOneSafe(id);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm user mới' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.createByAdmin(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Sửa thông tin user' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateByAdmin(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa user' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.removeByAdmin(id);
  }
}