import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MaintenenceService } from './maintenence.service';
import { CreateMaintenenceDto } from './dto/create-maintenence.dto';
import { UpdateMaintenenceDto } from './dto/update-maintenence.dto';

@Controller('maintenence')
export class MaintenenceController {
  constructor(private readonly maintenenceService: MaintenenceService) {}

  @Post()
  create(@Body() createMaintenenceDto: CreateMaintenenceDto) {
    return this.maintenenceService.create(createMaintenenceDto);
  }

  @Get()
  findAll() {
    return this.maintenenceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.maintenenceService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMaintenenceDto: UpdateMaintenenceDto,
  ) {
    return this.maintenenceService.update(+id, updateMaintenenceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.maintenenceService.remove(+id);
  }
}
