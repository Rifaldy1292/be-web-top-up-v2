import { Controller, Get } from '@nestjs/common';
import { DigiflazzService } from './digiflazz.service';

@Controller('digiflazz')
export class DigiflazzController {
  constructor(private readonly digiflazzService: DigiflazzService) {}

  @Get('products')
  findAll() {
    return this.digiflazzService.findAll();
  }
}
