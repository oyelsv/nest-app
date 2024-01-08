import { Injectable } from '@nestjs/common';
import { User as UserModel } from '@prisma/client';

import { PrismaService } from 'prisma/prisma.service';

import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async editUser(userId: string, dto: EditUserDto): Promise<UserModel> {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    delete user.hash;

    return user;
  }
}
