// giftvouchers/giftvouchers.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { GiftVouchersService } from '../services/giftvouchers.service'
import { GiftVoucherQueryDto } from '../dto/giftvoucher-query.dto';

@Controller('admin/giftvouchers')
export class GiftVouchersController {
  constructor(private readonly service: GiftVouchersService) {}

  @Get()
  getGiftVouchers(@Query() dto: GiftVoucherQueryDto) {
    return this.service.getGiftVouchers(dto);
  }
}