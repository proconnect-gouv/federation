import { Transform } from "class-transformer";
import { IsBoolean, IsISO8601, IsString } from "class-validator";
import { toBoolean } from "../../utils/transforms";
import { IsSafeString } from "../../utils/validators";

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
