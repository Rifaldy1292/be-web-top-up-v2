import { Module } from '@nestjs/common';
import { DigiflazzService } from './digiflazz.service';
import { DigiflazzController } from './digiflazz.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [DigiflazzController],
  providers: [DigiflazzService],
  exports: [DigiflazzService],
})
export class DigiflazzModule {}
