import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class UpdateIngredientDto {
  @ApiPropertyOptional({ example: 'Bột Matcha Nhật' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'g' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  unit?: string;

  @ApiPropertyOptional({ example: 1500 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}