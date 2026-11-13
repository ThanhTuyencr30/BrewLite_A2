import { IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class FindProductsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'category must be a lowercase slug',
  })
  category?: string;

  @IsOptional()
  @IsIn(['true', 'false'], {
    message: 'outOfStock must be true or false',
  })
  outOfStock?: 'true' | 'false';
}
