import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateMaintenenceDto } from './dto/create-maintenence.dto';
import { UpdateMaintenenceDto } from './dto/update-maintenence.dto';

@Injectable()
export class MaintenenceService {
  constructor(private prisma: PrismaService) {}

  async create(createMaintenenceDto: CreateMaintenenceDto) {
    return await this.prisma.maintenance.create({
      data: {
        title: createMaintenenceDto.title,
        content: createMaintenenceDto.content,
      },
    });
  }

  async findAll() {
    return await this.prisma.maintenance.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const maintenance = await this.prisma.maintenance.findUnique({
      where: { id },
    });

    if (!maintenance) {
      throw new NotFoundException('Maintenance tidak ditemukan');
    }

    return maintenance;
  }

  async update(id: number, updateMaintenenceDto: UpdateMaintenenceDto) {
    await this.findOne(id);

    return await this.prisma.maintenance.update({
      where: { id },
      data: updateMaintenenceDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return await this.prisma.maintenance.delete({
      where: { id },
    });
  }
}
