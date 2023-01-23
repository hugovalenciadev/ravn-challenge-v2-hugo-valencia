import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import RoleEnum from './enums/role.enum';

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

  async createClient(data: Prisma.UserCreateInput): Promise<User> {
    return this.save(data, RoleEnum.Client);
  }

  async createManager(data: Prisma.UserCreateInput): Promise<User> {
    return this.save(data, RoleEnum.Manager);
  }

  async save(data: Prisma.UserCreateInput, role: string): Promise<User> {
    const userExist = await this.findFirst({
      email: data.email,
    });

    if (userExist) {
      throw new BadRequestException('Bad Request', { cause: new Error(), description: 'Email already exist.' });
    }

    return await this.prismaService.$transaction(async (tx) => {
      const roleInstance = await tx.role.findUnique({
        where: {
          name: role,
        },
      });

      const userCreated = await tx.user.create({
        data,
      });

      await tx.userRole.create({
        data: {
          userId: userCreated.id,
          roleId: roleInstance.id,
        },
      });

      return userCreated;
    });
  }
}
