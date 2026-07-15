/* istanbul ignore file */

// Declarative code
import { Transform } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from "class-validator";
import { AlgoValue } from "../../enum";
import { VALID_EMAIL_REGEX } from "../../utils/regex/valid-email-regex";
import {
  defaultNoneOrLinesToNullableArray,
  linesToArray,
  toArray,
  toBoolean,
  toNullableString,
} from "../../utils/transforms/string.transform";
import { IsOptionalExtended } from "../../utils/validators/is-optional-extended.validator";
import { IsValidInputString } from "../../utils/validators/is-valid-input-string";

const { ES256, RS256, HS256 } = AlgoValue;

const URL_REGEX = /^https?:\/\/[^/].+$/;
export class ServiceProviderDto {
  @IsValidInputString({
    message: `Veuillez mettre un nom valide ( Majuscule, minuscule, nombres et '.:_/!+- [espace] )`,
  })
  @IsNotEmpty({
    message: `Le nom du fournisseur de service doit être renseigné`,
  })
  readonly name: string;

  @Transform(linesToArray)
  @IsOptionalExtended()
  @Matches(URL_REGEX, {
    each: true,
    message: "Veuillez mettre une url valide ( Ex: https://toto.com/ )",
  })
  readonly redirectUri: string[];

  @Transform(linesToArray)
  @Matches(URL_REGEX, {
    each: true,
    message: " Veuillez mettre une url valide ( Ex: https://toto.com/ )",
  })
  readonly redirectUriLogout: string[];

  @IsNotEmpty({
    message: "Veuillez faire un choix",
  })
  @Transform(toBoolean)
  readonly active: boolean;

  @IsNotEmpty({
    message: "Veuillez faire un choix",
  })
  @IsString()
  readonly type: string;

  @IsOptional()
  @Transform(toArray)
  @IsArray()
  readonly scopes: string[];

  @IsOptionalExtended()
  @IsIn([ES256, RS256, HS256], {
    message: `<strong>userinfo_signed_response_alg</strong> doit être une des valeurs suivantes: ${ES256}, ${RS256} ou ${HS256}`,
  })
  @Transform(toNullableString)
  // oidc defined variable name
  // tslint:disable-next-line: variable-name
  readonly userinfo_signed_response_alg?: string | null;

  @IsOptionalExtended()
  @IsIn([ES256, RS256, HS256], {
    message: `<strong>id_token_signed_response_alg</strong> doit être une des valeurs suivantes: ${ES256}, ${RS256} ou ${HS256}`,
  })
  // oidc defined variable name
  // tslint:disable-next-line: variable-name
  readonly id_token_signed_response_alg?: string;

  @IsOptional()
  @IsString()
  @Transform(toNullableString)
  // tslint:disable-next-line: variable-name
  readonly introspection_signed_response_alg?: string | null;

  @IsOptional()
  @IsString()
  @Transform(toNullableString)
  // tslint:disable-next-line: variable-name
  readonly introspection_encrypted_response_alg?: string | null;

  @IsOptional()
  @IsString()
  @Transform(toNullableString)
  // tslint:disable-next-line: variable-name
  readonly introspection_encrypted_response_enc?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(defaultNoneOrLinesToNullableArray)
  // tslint:disable-next-line: variable-name
  readonly response_types?: string[] | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(defaultNoneOrLinesToNullableArray)
  // tslint:disable-next-line: variable-name
  readonly grant_types?: string[] | null;

  @IsOptional()
  @Matches(URL_REGEX)
  @Transform(toNullableString)
  // tslint:disable-next-line: variable-name
  readonly jwks_uri?: string | null;

  @Transform(linesToArray)
  @IsOptionalExtended()
  @Matches(VALID_EMAIL_REGEX, {
    each: true,
    message: "Veuillez mettre une liste d'adresses email valides.",
  })
  readonly collaborators: string[];
}
