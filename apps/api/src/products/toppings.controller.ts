import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { AdminKeyGuard } from '../ingredients/admin-key.guard';
import { CreateToppingDto } from './create-topping.dto';
import { ToppingsService } from './toppings.service';

@ApiTags('Toppings')
@Controller('toppings')
export class ToppingsController {
  constructor(private readonly toppingsService: ToppingsService) {}

  @Get()
  findAll() {
    return this.toppingsService.findAll();
  }

  @Post()
  @ApiHeader({ name: 'x-admin-key', required: true })
  @UseGuards(AdminKeyGuard)
  create(@Body() dto: CreateToppingDto) {
    return this.toppingsService.create(dto);
  }
}