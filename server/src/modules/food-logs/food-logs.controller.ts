import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FoodLogsService } from './food-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFoodLogDto } from './dto/create-food-log.dto';
import { UpdateFoodLogDto } from './dto/update-food-log.dto';

@Controller('food-logs')
export class FoodLogsController {
  constructor(private readonly foodLogsService: FoodLogsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() createFoodLogDto: CreateFoodLogDto) {
    return this.foodLogsService.create(req.user.id, createFoodLogDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req, @Query('date') date?: string) {
    return this.foodLogsService.findAll(req.user.id, date);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.foodLogsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFoodLogDto: UpdateFoodLogDto,
  ) {
    return this.foodLogsService.update(id, updateFoodLogDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.foodLogsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats/summary')
  async getStats(@Request() req, @Query('period') period: string = 'week') {
    return this.foodLogsService.getStats(req.user.id, period);
  }
}
