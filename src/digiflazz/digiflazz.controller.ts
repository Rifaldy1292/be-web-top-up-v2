import { Controller, Get, Post } from '@nestjs/common';
import { DigiflazzService } from './digiflazz.service';

@Controller('digiflazz')
export class DigiflazzController {
  constructor(private readonly digiflazzService: DigiflazzService) {}

  @Get('products')
  findAll() {
    return this.digiflazzService.findAll();
  }
  @Post('fetch-latest')
  async fetchLatestPriceList() {
    await this.digiflazzService.fetchDigiflazzPriceList();
    return {
      status: 'ok',
      message: 'Digiflazz price list fetched successfully',
    };
  }
}
