import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminKeyGuard } from './admin-key.guard';
import { CreateIngredientDto } from './create-ingredient.dto';
import { RestockIngredientDto } from './restock-ingredient.dto';
import { UpdateIngredientDto } from './update-ingredient.dto';
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

  @Post()
  @ApiOperation({ summary: 'Thêm mới nguyên liệu' })
  create(@Body() dto: CreateIngredientDto) {
    return this.ingredientsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin nguyên liệu' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIngredientDto,
  ) {
    return this.ingredientsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa nguyên liệu' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientsService.remove(id);
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