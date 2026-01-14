import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { DigiflazzModule } from '../digiflazz/digiflazz.module';

@Module({
  imports: [DigiflazzModule],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
