import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFoodLogDto } from './dto/create-food-log.dto';
import { UpdateFoodLogDto } from './dto/update-food-log.dto';

@Injectable()
export class FoodLogsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createFoodLogDto: CreateFoodLogDto) {
    return this.prisma.foodLog.create({
      data: {
        ...createFoodLogDto,
        userId,
      },
    });
  }

  async findAll(userId: string, date?: string) {
    const whereClause: any = { userId };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      whereClause.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    return this.prisma.foodLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const foodLog = await this.prisma.foodLog.findUnique({
      where: { id },
    });

    if (!foodLog) {
      throw new NotFoundException('Food log not found');
    }

    return foodLog;
  }

  async update(id: string, updateFoodLogDto: UpdateFoodLogDto) {
    const foodLog = await this.prisma.foodLog.findUnique({
      where: { id },
    });

    if (!foodLog) {
      throw new NotFoundException('Food log not found');
    }

    return this.prisma.foodLog.update({
      where: { id },
      data: updateFoodLogDto,
    });
  }

  async remove(id: string) {
    const foodLog = await this.prisma.foodLog.findUnique({
      where: { id },
    });

    if (!foodLog) {
      throw new NotFoundException('Food log not found');
    }

    await this.prisma.foodLog.delete({
      where: { id },
    });

    return { message: 'Food log deleted successfully' };
  }

  async getStats(userId: string, period: string = 'week') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }

    const foodLogs = await this.prisma.foodLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalCalories = foodLogs.reduce((sum, log) => sum + log.calories, 0);
    const totalProtein = foodLogs.reduce((sum, log) => sum + log.protein, 0);
    const totalCarbs = foodLogs.reduce((sum, log) => sum + log.carbs, 0);
    const totalFat = foodLogs.reduce((sum, log) => sum + log.fat, 0);

    const avgCalories = foodLogs.length > 0 ? totalCalories / foodLogs.length : 0;

    return {
      period,
      totalEntries: foodLogs.length,
      totals: {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
      },
      averages: {
        calories: avgCalories,
        protein: foodLogs.length > 0 ? totalProtein / foodLogs.length : 0,
        carbs: foodLogs.length > 0 ? totalCarbs / foodLogs.length : 0,
        fat: foodLogs.length > 0 ? totalFat / foodLogs.length : 0,
      },
      logs: foodLogs,
    };
  }
}
