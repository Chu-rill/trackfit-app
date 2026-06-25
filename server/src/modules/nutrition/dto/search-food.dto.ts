import { IsNotEmpty, IsString } from 'class-validator';

export class SearchFoodDto {
  @IsString()
  @IsNotEmpty()
  query: string;
}
