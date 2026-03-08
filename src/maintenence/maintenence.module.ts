import { Module } from '@nestjs/common';
import { MaintenenceService } from './maintenence.service';
import { MaintenenceController } from './maintenence.controller';

@Module({
  controllers: [MaintenenceController],
  providers: [MaintenenceService],
})
export class MaintenenceModule {}
