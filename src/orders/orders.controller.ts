import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import RoleEnum from 'src/users/enums/role.enum';
import OrderStatus from './enums/order-status.enum';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(RoleEnum.Client)
  async create(@Req() req: Request) {
    return this.ordersService.create(req?.user['id']);
  }

  @Get('/last')
  @Roles(RoleEnum.Client)
  async last(@Req() req: Request) {
    return this.ordersService.findLast(req?.user['id']);
  }

  @Get()
  @Roles(RoleEnum.Manager)
  async getOrders(
    @Query('status') status?: OrderStatus,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take?: number,
  ) {
    return this.ordersService.findMany({
      where: {
        status: status,
      },
      skip,
      take,
    });
  }
}
