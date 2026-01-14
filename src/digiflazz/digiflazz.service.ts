import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { createHash } from 'crypto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class DigiflazzService {
  private readonly logger = new Logger(DigiflazzService.name);

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  @Cron('0 2 * * *')
  async handleCron() {
    this.logger.debug('Running Cron: Update Digiflazz Price List');
    await this.fetchDigiflazzPriceList();
  }

  async fetchDigiflazzPriceList() {
    const username = this.configService.get<string>('DIGIFLAZZ_USERNAME') || '';
    const apiKey = this.configService.get<string>('DIGIFLAZZ_APIKEY') || '';
    const sign = createHash('md5')
      .update(username + apiKey + 'pricelist')
      .digest('hex');

    try {
      const { data } = await lastValueFrom(
        this.httpService.post('https://api.digiflazz.com/v1/price-list', {
          cmd: 'prepaid',
          username,
          sign,
        }),
      );

      const products = data.data;
      if (!Array.isArray(products)) {
        this.logger.error('Invalid data format from Digiflazz');
        return;
      }

      for (const product of products) {
        await this.prisma.productDigiflazz.upsert({
          where: { buyerSkuCode: product.buyer_sku_code },
          update: {
            productName: product.product_name,
            category: product.category,
            brand: product.brand,
            type: product.type,
            sellerName: product.seller_name,
            price: product.price,
            stock: product.stock,
            buyerProductStatus: product.buyer_product_status,
            sellerProductStatus: product.seller_product_status,
            desc: product.desc,
          },
          create: {
            buyerSkuCode: product.buyer_sku_code,
            productName: product.product_name,
            category: product.category,
            brand: product.brand,
            type: product.type,
            sellerName: product.seller_name,
            price: product.price,
            stock: product.stock,
            buyerProductStatus: product.buyer_product_status,
            sellerProductStatus: product.seller_product_status,
            desc: product.desc,
          },
        });
      }
      this.logger.debug(`Updated ${products.length} products from Digiflazz`);
    } catch (error) {
      this.logger.error('Failed to fetch Digiflazz price list', error);
    }
  }

  async topUp(buyerSku: string, customerNo: string, refId: string) {
    const username = this.configService.get<string>('DIGIFLAZZ_USERNAME') || '';
    const apiKey = this.configService.get<string>('DIGIFLAZZ_APIKEY') || '';
    const sign = createHash('md5')
      .update(username + apiKey + refId)
      .digest('hex');

    try {
      const { data } = await lastValueFrom(
        this.httpService.post('https://api.digiflazz.com/v1/transaction', {
          username,
          buyer_sku_code: buyerSku,
          customer_no: customerNo,
          ref_id: refId,
          sign,
        }),
      );
      this.logger.debug(`TopUp Request for ${refId}: ${JSON.stringify(data)}`);
      return data;
    } catch (error) {
      this.logger.error(`TopUp Failed for ${refId}`, error);
      throw error;
    }
  }

  async findAll() {
    return this.prisma.productDigiflazz.findMany();
  }
}
