import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchFoodDto } from './dto/search-food.dto';
import { AnalyzeImageDto } from './dto/analyze-image.dto';
import { ScanBarcodeDto } from './dto/scan-barcode.dto';

@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @UseGuards(JwtAuthGuard)
  @Post('search')
  async searchFood(@Body() searchFoodDto: SearchFoodDto) {
    return this.nutritionService.searchFood(searchFoodDto.query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('analyze-image')
  async analyzeImage(@Body() analyzeImageDto: AnalyzeImageDto) {
    return this.nutritionService.analyzeImage(analyzeImageDto.imageUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Post('scan-barcode')
  async scanBarcode(@Body() scanBarcodeDto: ScanBarcodeDto) {
    return this.nutritionService.scanBarcode(scanBarcodeDto.barcode);
  }
}
