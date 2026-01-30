import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BannersService } from './banners.service';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('banner', {
      storage: diskStorage({
        destination: './uploads/banners',
        filename: (request, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExtension = extname(file.originalname);
          callback(null, `banner-${uniqueSuffix}${fileExtension}`);
        },
      }),
    }),
  )
  create(
    @UploadedFile() uploadedBanner: Express.Multer.File,
    @Body('name') name: string,
  ) {
    const imageUrl = `/uploads/banners/${uploadedBanner.filename}`;
    console.log(name);
    return this.bannersService.create({
      name,

      imageUrl,
    });
  }

  @Get()
  findAll() {
    return this.bannersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bannersService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
    return this.bannersService.update(Number(id), updateBannerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bannersService.remove(Number(id));
  }
}
