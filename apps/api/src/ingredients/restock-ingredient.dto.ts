import { IsInt, Max, Min } from 'class-validator';

export class RestockIngredientDto {
  @IsInt()
  @Min(1)
  @Max(1000000)
  quantity!: number;
}
