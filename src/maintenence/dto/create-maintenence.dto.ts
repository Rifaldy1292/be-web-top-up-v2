import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateMaintenenceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
