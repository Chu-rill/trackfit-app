import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        height: true,
        weight: true,
        gender: true,
        activityLevel: true,
        goals: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        height: true,
        weight: true,
        gender: true,
        activityLevel: true,
        goals: true,
        updatedAt: true,
      },
    });
  }

  async getStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const foodLogs = await this.prisma.foodLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: today,
        },
      },
    });

    const totalCalories = foodLogs.reduce((sum, log) => sum + log.calories, 0);
    const totalProtein = foodLogs.reduce((sum, log) => sum + log.protein, 0);
    const totalCarbs = foodLogs.reduce((sum, log) => sum + log.carbs, 0);
    const totalFat = foodLogs.reduce((sum, log) => sum + log.fat, 0);

    return {
      today: {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        entries: foodLogs.length,
      },
    };
  }
}
