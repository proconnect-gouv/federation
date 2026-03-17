import { CrsfToken } from "@fc/oidc-client";
import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsOptional } from "class-validator";

export class RedirectToIdp extends CrsfToken {
  @IsEmail()
  readonly email: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === "on", { toClassOnly: true })
  readonly rememberMe: boolean;
}
