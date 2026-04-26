import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
    //cek apakah harga req dari fe sesuai dengan db
    const amountRilOnDb = await this.prisma.listPacket.findFirst({
      where: { product_digiflazz_id: dto.sku },
    });
    console.log('ini 1', amountRilOnDb);
    console.log('ini 2', dto.amount);
    if (amountRilOnDb) {
      if (amountRilOnDb.price != dto.amount) {
        throw new BadRequestException(
          'Harga yang dikirim tidak sesuai database',
        );
      }
    } else {
      throw new BadRequestException('SKU tidak ditemukan');
    }
    //naikan harga 5% untuk default
    const finalPrice = Math.floor(dto.amount * 1.05);

    await this.prisma.productDigiflazz.findFirst({
      where: { buyerSkuCode: dto.sku },
    });
    // Save to DB first
    await this.prisma.transaction.create({
      data: {
        orderId,
        amount: finalPrice,
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
        gross_amount: finalPrice,
      },
      item_details: [
        {
          id: dto.sku,
          price: finalPrice,
          quantity: 1,
          name: dto.sku,
        },
      ],
      customer_details: {},
      credit_card: { secure: true },
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
    try {
      const statusResponse = await this.snap.transaction.status(
        notification.orderId,
      );
      console.log(statusResponse);
      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;
      // Default status
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
      // Trigger Digiflazz if Settlement and strictly not already processed
      // We assume if it's already SETTLEMENT in DB before this update, it might have been processed.
      // However, the update above sets it to dbStatus. So we should check the OLD status.
      // For safety, let's blindly trust if dbStatus is SETTLEMENT we attempt topup IF it wasn't already SETTLEMENT.
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
    } catch (error) {
      console.log(error);
    }
  }

  async checkTransactionStatus(orderId: string) {
    if (!orderId) {
      throw new NotFoundException('orderId wajib diisi');
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { orderId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaksi tidak ditemukan');
    }
    let product;
    if (!transaction.sku) {
      product = {};
    } else {
      product = await this.prisma.listPacket.findFirst({
        where: {
          product_digiflazz_id: transaction.sku,
        },
      });
    }

    return {
      transaction,
      product,
    };
  }
}
