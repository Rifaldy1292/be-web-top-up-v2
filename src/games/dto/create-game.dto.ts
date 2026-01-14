import { IsBooleanString, IsNotEmpty, IsString } from 'class-validator';

export class CreateGameDto {
  @IsString()
  @IsNotEmpty()
  gameName: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsBooleanString()
  status: string;
}
