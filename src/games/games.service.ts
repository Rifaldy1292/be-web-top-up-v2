import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateGameDto } from './dto/update-game.dto';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.listGame.create({ data });
  }

  async hitCoda(body: string): Promise<unknown> {
    const response = await fetch(
      'https://order-sg.codashop.com/initPayment.action',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      },
    );
    return await response.json();
  }
  //logic untuk antrian
  private requestQueue: Array<{
    id: string;
    server: string;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  private isProcessing = false;
  async cekIdServer(id: string, server: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ id, server, resolve, reject });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;

    const nextRequest = this.requestQueue.shift();
    if (!nextRequest) return;

    this.isProcessing = true;

    try {
      // delay antar request (anti spam / anti rate limit)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const body = `voucherPricePoint.id=4150&voucherPricePoint.price=1579&voucherPricePoint.variablePrice=0&user.userId=${nextRequest.id}&user.zoneId=${nextRequest.server}&voucherTypeName=MOBILE_LEGENDS&shopLang=id_ID`;

      const data: any = await this.hitCoda(body);
      if (!data.success) {
        throw new BadRequestException('Gagal Di Proses Oleh Api Cek ID');
      }
      if (!data?.confirmationFields?.username) {
        throw new Error('Username tidak ditemukan');
      }

      nextRequest.resolve({
        success: true,
        game: 'Mobile Legends: Bang Bang',
        id: nextRequest.id,
        server: nextRequest.server,
        name: data.confirmationFields.username,
      });
    } catch (error) {
      nextRequest.reject(error);
    } finally {
      console.log(this.requestQueue);
      this.isProcessing = false;
      this.processQueue(); // lanjutkan antrian berikutnya
    }
  }

  async findAll() {
    const games = await this.prisma.listGame.findMany();
    const popularGames = games.slice(0, 3);
    return {
      data: games,
      popular: popularGames,
    };
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
