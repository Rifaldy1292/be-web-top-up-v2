import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';
import type { Request } from 'express';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  create(
    @Req() req: Request,
    @Body() body: { amount: number; sku: string; customerNo: string },
  ) {
    const userId = (req.user as any)['sub'];
    return this.transactionService.createTransaction(userId, body);
  }

  @Post('notification')
  notification(@Body() body: any) {
    return this.transactionService.handleNotification(body);
  }
}
