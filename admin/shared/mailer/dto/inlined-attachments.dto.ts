import { IsDefined, IsString } from 'class-validator';

export class InlinedAttachments {
  @IsDefined()
  @IsString()
  ContentType: string;

  @IsDefined()
  @IsString()
  Filename: string;

  @IsDefined()
  @IsString()
  ContentID: string;

  @IsDefined()
  @IsString()
  Base64Content: string;
}
