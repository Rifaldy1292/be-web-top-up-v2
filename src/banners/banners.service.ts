import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';
@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBannerDto: CreateBannerDto) {
    return this.prisma.banner.create({
      data: createBannerDto,
    });
  }

  async findAll() {
    return this.prisma.banner.findMany();
  }

  async findOne(id: number) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });
    if (!banner)
      throw new NotFoundException(`Banner dengan id ${id} tidak ditemukan`);
    return banner;
  }

  async update(id: number, updateBannerDto: UpdateBannerDto) {
    await this.findOne(id); // cek dulu banner ada atau tidak
    return this.prisma.banner.update({
      where: { id },
      data: updateBannerDto,
    });
  }

  async remove(id: number) {
    const banner = await this.findOne(id);

    if (banner.imageUrl) {
      const filePath = join(process.cwd(), banner.imageUrl.replace('/', ''));

      try {
        await unlink(filePath);
      } catch (error) {
        // file tidak ada → jangan gagalkan delete DB
        console.warn('File banner tidak ditemukan:', filePath);
      }
    }

    return this.prisma.banner.delete({
      where: { id },
    });
  }
}
