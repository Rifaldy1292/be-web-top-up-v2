import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { BannersModule } from './banners/banners.module';
import { DigiflazzModule } from './digiflazz/digiflazz.module';
import { TransactionModule } from './transaction/transaction.module';
import { ListPacketModule } from './list-packet/list-packet.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MaintenenceModule } from './maintenence/maintenence.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    GamesModule,
    BannersModule,
    DigiflazzModule,
    TransactionModule,
    ListPacketModule,
    MaintenenceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
