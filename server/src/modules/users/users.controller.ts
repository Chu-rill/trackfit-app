import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findOne(user.id);
  }

  @UseGuards(AuthGuard)
  @Put('me')
  async updateProfile(@CurrentUser() user: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Get('stats')
  async getStats(@CurrentUser() user: any) {
    return this.usersService.getStats(user.id);
  }
}
