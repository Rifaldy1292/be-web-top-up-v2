import {
  IsString,
  IsNotEmpty,
  IsBooleanString,
  IsOptional,
} from 'class-validator';

export class CreateGameDto {
  @IsString()
  @IsNotEmpty()
  gameName: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsBooleanString()
  status: string;

  // diisi controller (hasil upload)
  @IsOptional()
  @IsString()
  urlGamesImage?: string;

  @IsOptional()
  @IsString()
  urlGameBanner?: string;
}
