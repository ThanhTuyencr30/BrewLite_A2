import { Module } from '@nestjs/common';
import { AdminKeyGuard } from '../ingredients/admin-key.guard';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ToppingsController } from './toppings.controller';
import { ToppingsService } from './toppings.service';

@Module({
  controllers: [ProductsController, ToppingsController],
  providers: [ProductsService, ToppingsService, AdminKeyGuard],
})
export class ProductsModule {}
