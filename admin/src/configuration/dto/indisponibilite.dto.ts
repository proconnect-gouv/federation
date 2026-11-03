import { Transform } from "class-transformer";
import { IsBoolean, IsISO8601, IsString, Matches } from "class-validator";
import { VALID_INPUT_STRING_REGEX } from "../../utils/regex/valid-input-string-regex";
import { toBoolean } from "../../utils/transforms";

export class IndisponibiliteDTO {
  @Matches(VALID_INPUT_STRING_REGEX)
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
