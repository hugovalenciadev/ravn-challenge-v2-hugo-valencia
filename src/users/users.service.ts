import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export type UserWithUserRole = Prisma.UserGetPayload<{
  include: {
    userRoles: {
      include: {
        role: true;
      };
    };
  };
}>;

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findFirst(where: Prisma.UserWhereInput): Promise<UserWithUserRole | null> {
    return this.prismaService.user.findFirst({
      where,
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  }
}
