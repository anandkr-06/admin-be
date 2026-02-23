// giftvouchers/giftvouchers.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GiftVouchersController } from '../giftvouchers/controllers/giftvouchers.controller'
import { GiftVouchersService } from '../giftvouchers/services/giftvouchers.service'
import { GiftVoucher, GiftVoucherSchema } from '../giftvouchers/schema/giftvouchers.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GiftVoucher.name, schema: GiftVoucherSchema },
    ]),
  ],
  controllers: [GiftVouchersController],
  providers: [GiftVouchersService],
})
export class GiftVouchersModule {}