import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { DigiflazzService } from '../digiflazz/digiflazz.service';
import * as MidtransClient from 'midtrans-client';

@Injectable()
export class TransactionService {
  private snap: any;
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private digiflazzService: DigiflazzService,
  ) {
    this.snap = new MidtransClient.Snap({
      isProduction: this.configService.get('MIDTRANS_IS_PRODUCTION') === 'true',
      serverKey: this.configService.get('MIDTRANS_SERVER_KEY'),
      clientKey: this.configService.get('MIDTRANS_CLIENT_KEY'),
    });
  }

  async createTransaction(
    userId: number,
    dto: { amount: number; sku: string; customerNo: string },
  ) {
    const orderId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Save to DB first
    await this.prisma.transaction.create({
      data: {
        orderId,
        amount: dto.amount,
        sku: dto.sku,
        customerNo: dto.customerNo,
        userId,
        paymentMethod: 'midtrans', // default, updated later?
        status: 'PENDING',
      },
    });

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: dto.amount,
      },
      item_details: [
        {
          id: dto.sku,
          price: dto.amount,
          quantity: 1,
          name: dto.sku,
        },
      ],
      customer_details: {
        // optionally fetch user details
      },
    };

    const transaction = await this.snap.createTransaction(parameter);
    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      orderId,
    };
  }

  async handleNotification(notification: any) {
    this.logger.log(`Midtrans Notification: ${JSON.stringify(notification)}`);
    const statusResponse =
      await this.snap.transaction.notification(notification);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let dbStatus: 'PENDING' | 'SETTLEMENT' | 'EXPIRE' | 'CANCEL' = 'PENDING';

    if (transactionStatus == 'capture') {
      if (fraudStatus == 'challenge') {
        dbStatus = 'PENDING'; // Challenge
      } else if (fraudStatus == 'accept') {
        dbStatus = 'SETTLEMENT';
      }
    } else if (transactionStatus == 'settlement') {
      dbStatus = 'SETTLEMENT';
    } else if (
      transactionStatus == 'cancel' ||
      transactionStatus == 'deny' ||
      transactionStatus == 'expire'
    ) {
      dbStatus = 'CANCEL'; // or EXPIRE
      if (transactionStatus == 'expire') dbStatus = 'EXPIRE';
    } else if (transactionStatus == 'pending') {
      dbStatus = 'PENDING';
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { orderId },
    });
    if (!transaction) return { message: 'Transaction not found' };

    // Update DB
    await this.prisma.transaction.update({
      where: { orderId },
      data: { status: dbStatus },
    });

    // Trigger Digiflazz if Settlement
    if (dbStatus === 'SETTLEMENT' && transaction.status !== 'SETTLEMENT') {
      if (transaction.sku && transaction.customerNo) {
        try {
          await this.digiflazzService.topUp(
            transaction.sku,
            transaction.customerNo,
            orderId,
          );
        } catch (e) {
          this.logger.error('Digiflazz TopUp Error', e);
        }
      }
    }

    return { status: 'ok' };
  }
}
