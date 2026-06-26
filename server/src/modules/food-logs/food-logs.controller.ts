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
} from '@nestjs/common';
import { FoodLogsService } from './food-logs.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateFoodLogDto } from './dto/create-food-log.dto';
import { UpdateFoodLogDto } from './dto/update-food-log.dto';

@Controller('food-logs')
export class FoodLogsController {
  constructor(private readonly foodLogsService: FoodLogsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@CurrentUser() user: any, @Body() createFoodLogDto: CreateFoodLogDto) {
    return this.foodLogsService.create(user.id, createFoodLogDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@CurrentUser() user: any, @Query('date') date?: string) {
    return this.foodLogsService.findAll(user.id, date);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.foodLogsService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFoodLogDto: UpdateFoodLogDto,
  ) {
    return this.foodLogsService.update(id, updateFoodLogDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.foodLogsService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Get('stats/summary')
  async getStats(@CurrentUser() user: any, @Query('period') period: string = 'week') {
    return this.foodLogsService.getStats(user.id, period);
  }
}
