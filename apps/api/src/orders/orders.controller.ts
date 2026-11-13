import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { OrderStatus } from '../generated/prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

type AuthenticatedRequest = Request & { user: { userId: string } };

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Req() request: AuthenticatedRequest, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(request.user.userId, dto);
  }

  @Get('me')
  getMyOrders(
    @Req() request: AuthenticatedRequest,
    @Query('status', new ParseEnumPipe(OrderStatus, { optional: true }))
    status?: OrderStatus,
  ) {
    return this.ordersService.getMyOrders(request.user.userId, status);
  }

  @Get(':id')
  getOrderDetail(@Param('id', ParseUUIDPipe) id: string, @Req() request: AuthenticatedRequest) {
    return this.ordersService.getOrderDetail(id, request.user.userId);
  }

  @Post(':id/cancel')
  cancelOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
    @Body('reason') reason?: string,
  ) {
    return this.ordersService.cancelOrder(id, request.user.userId, reason);
  }
}