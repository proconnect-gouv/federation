import { IsString, Length, IsAscii } from 'class-validator';

export class Interaction {
  @IsString()
  @IsAscii()
  @Length(21, 21)
  readonly uid: string;
}
