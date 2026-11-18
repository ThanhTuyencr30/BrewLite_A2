import { IsEmail, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString()
  fullName?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsInt() @Min(0)
  loyaltyPoints?: number;
}