import { Body, Controller, Post, Req, Get, Param } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import type { Request } from 'express';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(
    @Req() req: Request,
    @Body() body: { amount: number; sku: string; customerNo: string },
  ) {
    //sementara harcode karena akan selalu belum login
    const userId = 1;
    return this.transactionService.createTransaction(userId, body);
  }

  @Post('notification')
  notification(@Body() body: any) {
    this.transactionService.handleNotification(body);
    return { status: 'ok' };
  }
  @Get('status/:orderId')
  checkStatus(@Param('orderId') orderId: string) {
    return this.transactionService.checkTransactionStatus(orderId);
  }
}
