import { Injectable } from '@nestjs/common';
import { UpdateGameDto } from './dto/update-game.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.listGame.create({ data });
  }

  findAll() {
    return this.prisma.listGame.findMany();
  }

  findOne(id: number) {
    return this.prisma.listGame.findUnique({ where: { id } });
  }

  findBySlug(slug: string) {
    return this.prisma.listGame.findUnique({ where: { slug } });
  }

  update(id: number, updateGameDto: UpdateGameDto) {
    const data: any = { ...updateGameDto };
    if (data.status) {
      data.status = data.status === 'true';
    }

    return this.prisma.listGame.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.listGame.delete({ where: { id } });
  }
}
