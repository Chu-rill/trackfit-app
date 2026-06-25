import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { FoodLogsModule } from './modules/food-logs/food-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    NutritionModule,
    FoodLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
