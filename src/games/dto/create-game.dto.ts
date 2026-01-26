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

export class Result {
  success: boolean;
  game?: string;
  id?: number | string;
  server?: string | number;
  name?: string;
  message?: string;
}
