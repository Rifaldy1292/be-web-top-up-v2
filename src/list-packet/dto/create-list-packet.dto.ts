import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateListPacketDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  gameId: number;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
