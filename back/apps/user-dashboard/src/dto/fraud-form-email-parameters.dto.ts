/* istanbul ignore file */

// Declarative code
import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class FraudFormEmailParameters {
  @IsString()
  given_name: string;

  @IsString()
  family_name: string;

  @IsString()
  birthdate: string;

  @IsString()
  birthplace: string;

  @IsString()
  birthcountry: string;

  @IsEmail()
  contactEmail: string;

  @IsEmail()
  idpEmail: string;

  @IsUUID(4)
  authenticationEventId: string;

  @IsString()
  fraudSurveyOrigin: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
}
