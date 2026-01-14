import { PartialType } from '@nestjs/mapped-types';
import { CreateListPacketDto } from './create-list-packet.dto';

export class UpdateListPacketDto extends PartialType(CreateListPacketDto) {}
