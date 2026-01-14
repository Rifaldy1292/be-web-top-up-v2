import { Module } from '@nestjs/common';
import { ListPacketService } from './list-packet.service';
import { ListPacketController } from './list-packet.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ListPacketController],
  providers: [ListPacketService],
})
export class ListPacketModule {}
