/* istanbul ignore file */

// Declarative code
import {
  IsNotEmpty,
  Matches,
  IsArray,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  defaultNoneOrLinesToNullableArray,
  linesToArray,
  toArray,
  toBoolean,
  toNullableString,
} from '../../utils/transforms/string.transform';
import { IsOptionalExtended } from '../../utils/validators/is-optional-extended.validator';
import { IsValidInputString } from '../../utils/validators/is-valid-input-string';
import { AlgoValue } from '../../enum';
import { IP_VALIDATOR_REGEX } from '../../utils/ip-validator.constant';

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
    message: 'Veuillez mettre une url valide ( Ex: https://toto.com/ )',
  })
  readonly redirectUri: string[];

  @Transform(linesToArray)
  @Matches(URL_REGEX, {
    each: true,
    message: ' Veuillez mettre une url valide ( Ex: https://toto.com/ )',
  })
  readonly redirectUriLogout: string[];

  @IsOptional()
  @Transform(linesToArray)
  @Matches(/^$|^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/, {
    each: true,
    message: 'Veuillez mettre des emails valides ( Ex: email@email.com )',
  })
  readonly emails: string[];
  // match empty string because of optionals parameters
  // impossible to use IsOptionalExtended because of the Transform which always return something
  @Transform(linesToArray)
  @Matches(IP_VALIDATOR_REGEX, {
    each: true,
    message: 'Veuillez mettre des ips valides ( Ex: 1.1.1.1 )',
  })
  readonly ipAddresses: string[];

  @IsNotEmpty({
    message: 'Veuillez faire un choix',
  })
  @Transform(toBoolean)
  readonly active: boolean;

  @IsNotEmpty({
    message: 'Veuillez faire un choix',
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
}
