import { Transform } from "class-transformer";
import {
  IsAscii,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
} from "class-validator";

export class RedirectToIdp {
  @IsEmail()
  readonly email!: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === "on", { toClassOnly: true })
  readonly rememberMe!: boolean;

  @IsString()
  @IsAscii()
  readonly csrfToken!: string;
}
