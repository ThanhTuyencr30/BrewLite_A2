import { Module } from '@nestjs/common';
import { AdminKeyGuard } from './admin-key.guard';
import { IngredientsController } from './ingredients.controller';
import { IngredientsService } from './ingredients.service';

@Module({
  controllers: [IngredientsController],
  providers: [IngredientsService, AdminKeyGuard],
})
export class IngredientsModule {}
