import { Controller, Get, Body, Patch, UseGuards } from '@nestjs/common';
import { User as UserModel } from '@prisma/client';

import { JwtGuard } from 'auth/guard';
import { GetUser } from 'auth/decorator';

import { UserService } from './user.service';

import { EditUserDto } from './dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@GetUser() user: UserModel): UserModel {
    return user;
  }

  @Patch()
  editUser(@GetUser('id') userId: string, @Body() dto: EditUserDto): Promise<UserModel> {
    return this.userService.editUser(userId, dto);
  }
}
