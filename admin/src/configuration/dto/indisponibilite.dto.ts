import { IsString, IsBoolean, IsISO8601 } from 'class-validator';
import { Transform } from 'class-transformer';
import { toBoolean } from '../../utils/transforms';

import { IsSafeString } from '../../utils/validators';

export class IndisponibiliteDTO {
  @IsSafeString()
  @IsString()
  message: string;

  @IsISO8601()
  dateDebut: string;

  @IsString()
  heureDebut: string;

  @IsISO8601()
  dateFin: string;

  @IsString()
  heureFin: string;

  @Transform(toBoolean)
  @IsBoolean()
  activateMessage: boolean;
}
