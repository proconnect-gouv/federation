import { IsOptional, IsString } from 'class-validator';

export class AppSession {
  @IsOptional()
  @IsString()
  // The sp id of the aggregator if given in the authorize
  readonly finalSpId?: string;

  @IsOptional()
  @IsString()
  readonly userLogin?: string;
}
