import { PartialType } from '@nestjs/mapped-types';
import { CreateMaintenenceDto } from './create-maintenence.dto';

export class UpdateMaintenenceDto extends PartialType(CreateMaintenenceDto) {}
