// orders.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { OrderQueryDto } from '../dto/order-query.dto';

@Controller('admin/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getOrders(@Query() query: OrderQueryDto) {
    return this.ordersService.getOrders(query);
  }
}