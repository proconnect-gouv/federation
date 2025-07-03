import { IsDefined, IsString } from 'class-validator';

export class Attachements {
  @IsDefined()
  @IsString()
  ContentType: string;

  @IsDefined()
  @IsString()
  Filename: string;

  @IsDefined()
  @IsString()
  Base64Content: string;
}
