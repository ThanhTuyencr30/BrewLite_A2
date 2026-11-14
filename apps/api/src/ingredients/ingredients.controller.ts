import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminKeyGuard } from './admin-key.guard';
import { RestockIngredientDto } from './restock-ingredient.dto';
import { IngredientsService } from './ingredients.service';

@ApiTags('Ingredients')
@ApiHeader({ name: 'x-admin-key', required: true })
@UseGuards(AdminKeyGuard)
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get()
  @ApiOperation({ summary: 'Xem tồn kho nguyên liệu' })
  findAll() {
    return this.ingredientsService.findAll();
  }

  @Post(':id/restock')
  @ApiOperation({ summary: 'Nhập thêm nguyên liệu (cộng vào tồn kho)' })
  restock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RestockIngredientDto,
  ) {
    return this.ingredientsService.restock(id, dto.quantity);
  }
}
