import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import RoleEnum from 'src/users/enums/role.enum';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('/')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleEnum.Client)
  async create(@Req() req: Request) {
    return this.ordersService.create(req?.user['id']);
  }
}
