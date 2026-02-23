import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';
import { unlinkSync } from 'fs';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @UseGuards(AccessTokenGuard) // Admin check TODO
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'banner', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
          },
        }),
      },
    ),
  )
  create(
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; banner?: Express.Multer.File[] },
    @Body() createGameDto: CreateGameDto,
  ) {
    const urlGamesImage = files.image
      ? `/uploads/${files.image[0].filename}`
      : '';
    const urlGameBanner = files.banner
      ? `/uploads/${files.banner[0].filename}`
      : '';

    return this.gamesService.create({
      ...createGameDto,
      status: createGameDto.status === 'true',
      urlGamesImage,
      urlGameBanner,
    });
  }

  @Get()
  findAll() {
    return this.gamesService.findAll();
  }

  @Get('cek-id')
  async cek(@Query('id') id: string, @Query('server') server: string) {
    return this.gamesService.cekIdServer(id, server);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gamesService.findOne(+id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.gamesService.findBySlug(slug);
  }

  @Patch(':id')
  // @UseGuards(AccessTokenGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'urlGamesImage', maxCount: 1 },
        { name: 'urlGameBanner', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/game-images',
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
          },
        }),
      },
    ),
  )
  async update(
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      urlGamesImage?: Express.Multer.File[];
      urlGameBanner?: Express.Multer.File[];
    },
    @Body() updateGameDto: UpdateGameDto,
  ) {
    const gameId = Number(id);

    const existingGame = await this.gamesService.findOne(gameId);
    if (!existingGame) {
      throw new NotFoundException('Game tidak ditemukan');
    }

    let urlGamesImage = existingGame.urlGamesImage;
    let urlGameBanner = existingGame.urlGameBanner;

    // ===== HANDLE HAPUS IMAGE (STRING KOSONG) =====
    if (updateGameDto.urlGamesImage === '') {
      if (existingGame.urlGamesImage) {
        try {
          unlinkSync(`.${existingGame.urlGamesImage}`);
        } catch (err) {
          console.log(err);
        }
      }
      urlGamesImage = '';
    }

    if (updateGameDto.urlGameBanner === '') {
      if (existingGame.urlGameBanner) {
        try {
          unlinkSync(`.${existingGame.urlGameBanner}`);
        } catch (err) {
          console.log(err);
        }
      }
      urlGameBanner = '';
    }

    // ===== HANDLE UPLOAD IMAGE BARU =====
    if (files.urlGamesImage?.length) {
      if (existingGame.urlGamesImage) {
        try {
          unlinkSync(`.${existingGame.urlGamesImage}`);
        } catch (err) {
          console.log(err);
        }
      }
      urlGamesImage = `/uploads/game-images/${files.urlGamesImage[0].filename}`;
    }

    if (files.urlGameBanner?.length) {
      if (existingGame.urlGameBanner) {
        try {
          unlinkSync(`.${existingGame.urlGameBanner}`);
        } catch (err) {
          console.log(err);
        }
      }
      urlGameBanner = `/uploads/game-images/${files.urlGameBanner[0].filename}`;
    }

    return this.gamesService.update(gameId, {
      ...updateGameDto,
      status: updateGameDto.status,
      urlGamesImage,
      urlGameBanner,
    });
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  remove(@Param('id') id: string) {
    return this.gamesService.remove(+id);
  }
}
