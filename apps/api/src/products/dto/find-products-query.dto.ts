import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class FindProductsQueryDto {
  @ApiPropertyOptional({ description: 'Từ khóa tìm kiếm (có dấu hoặc không dấu)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ description: 'Slug danh mục (vd: ca-phe, tra-sua)' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'category must be a lowercase slug',
  })
  category?: string;

  @ApiPropertyOptional({ description: 'Lọc món hết hàng (true = chỉ lấy món hết, false = chỉ lấy món còn)', enum: ['true', 'false'] })
  @IsOptional()
  @IsIn(['true', 'false'], {
    message: 'outOfStock must be true or false',
  })
  outOfStock?: 'true' | 'false';
}