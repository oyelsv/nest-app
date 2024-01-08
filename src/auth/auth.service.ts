import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as argon from 'argon2';

import { PrismaService } from 'prisma/prisma.service';

import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private configService: ConfigService
  ) {}
  async signup(dto: AuthDto): Promise<{ access_token: string }> {
    // generate password hash
    const hash = await argon.hash(dto.password);
    // save the new user in db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }

      throw error;
    }
  }

  async signin(dto: AuthDto): Promise<{ access_token: string }> {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // if user not found, throw an error
    if (!user) {
      throw new ForbiddenException('Wrong credentials');
    }

    // compare the password hashes
    const isPasswordMatching = await argon.verify(user.hash, dto.password);

    if (!isPasswordMatching) {
      throw new ForbiddenException('Wrong credentials');
    }

    // send back the user
    delete user.hash;
    return this.signToken(user.id, user.email);
  }

  async signToken(userId: string, email: string): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.configService.get<string>('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '90d',
      secret,
    });

    return {
      access_token: token,
    };
  }
}
