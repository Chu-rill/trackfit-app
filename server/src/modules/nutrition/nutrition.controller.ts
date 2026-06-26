import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { SearchFoodDto } from './dto/search-food.dto';
import { AnalyzeImageDto } from './dto/analyze-image.dto';
import { ScanBarcodeDto } from './dto/scan-barcode.dto';

@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @UseGuards(AuthGuard)
  @Post('search')
  async searchFood(@Body() searchFoodDto: SearchFoodDto) {
    return this.nutritionService.searchFood(searchFoodDto.query);
  }

  @UseGuards(AuthGuard)
  @Post('analyze-image')
  async analyzeImage(@Body() analyzeImageDto: AnalyzeImageDto) {
    return this.nutritionService.analyzeImage(analyzeImageDto.imageUrl);
  }

  @UseGuards(AuthGuard)
  @Post('scan-barcode')
  async scanBarcode(@Body() scanBarcodeDto: ScanBarcodeDto) {
    return this.nutritionService.scanBarcode(scanBarcodeDto.barcode);
  }
}
