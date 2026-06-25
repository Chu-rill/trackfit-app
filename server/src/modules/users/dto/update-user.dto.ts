import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: string;

  @IsOptional()
  @IsEnum(['sedentary', 'light', 'moderate', 'active', 'very_active'])
  activityLevel?: string;

  @IsOptional()
  @IsString()
  goals?: string;
}
