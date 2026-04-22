import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListPacketDto } from './dto/create-list-packet.dto';
import { UpdateListPacketDto } from './dto/update-list-packet.dto';

@Injectable()
export class ListPacketService {
  constructor(private prisma: PrismaService) {}

  create(createListPacketDto: CreateListPacketDto) {
    return this.prisma.listPacket.create({
      data: createListPacketDto,
    });
  }

  findAll() {
    return this.prisma.listPacket.findMany({
      include: {
        game: true,
      },
    });
  }

  async findByGameId(gameId: number) {
    return this.prisma.listPacket.findMany({
      where: {
        gameId: gameId, // field gameId di tabel list_packet
      },
      orderBy: {
        price: 'asc', // optional
      },
    });
  }
  findOne(id: number) {
    return this.prisma.listPacket.findUnique({
      where: { id },
      include: {
        game: true,
      },
    });
  }

  update(id: number, updateListPacketDto: UpdateListPacketDto) {
    return this.prisma.listPacket.update({
      where: { id },
      data: updateListPacketDto,
    });
  }

  remove(id: number) {
    return this.prisma.listPacket.delete({
      where: { id },
    });
  }
}
