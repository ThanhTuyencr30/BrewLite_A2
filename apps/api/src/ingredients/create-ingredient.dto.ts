import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateIngredientDto {
  @ApiProperty({ example: 'Matcha' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'g' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ example: 2000 })
  @IsInt()
  @Min(0)
  stock: number;
}