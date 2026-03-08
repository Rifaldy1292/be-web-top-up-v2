import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ListPacketService } from './list-packet.service';
import { CreateListPacketDto } from './dto/create-list-packet.dto';
import { UpdateListPacketDto } from './dto/update-list-packet.dto';

@Controller('list-packet')
export class ListPacketController {
  constructor(private readonly listPacketService: ListPacketService) {}

  // @UseGuards(AccessTokenGuard)
  @Post()
  create(@Body() createListPacketDto: CreateListPacketDto) {
    return this.listPacketService.create(createListPacketDto);
  }
  @Get('game/:gameId')
  findByGame(@Param('gameId') gameId: number) {
    return this.listPacketService.findByGameId(+gameId);
  }

  @Get()
  findAll() {
    return this.listPacketService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listPacketService.findOne(+id);
  }

  // @UseGuards(AccessTokenGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateListPacketDto: UpdateListPacketDto,
  ) {
    return this.listPacketService.update(+id, updateListPacketDto);
  }

  // @UseGuards(AccessTokenGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listPacketService.remove(+id);
  }
}
