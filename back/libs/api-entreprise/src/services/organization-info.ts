//

import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

//

export class OrganizationInfo {
  @IsString()
  activitePrincipale: string;

  @IsString()
  adresse: string;

  @IsString()
  categorieJuridique: string;

  @IsString()
  codeOfficielGeographique: string;

  @IsString()
  @IsOptional()
  codePostal: string | null;

  @IsString()
  enseigne: string;

  @IsBoolean()
  estActive: boolean;

  @IsBoolean()
  estDiffusible: boolean;

  @IsString()
  etatAdministratif: string;

  @IsString()
  libelle: string;

  @IsString()
  libelleActivitePrincipale: string;

  @IsString()
  libelleCategorieJuridique: string;

  @IsString()
  libelleTrancheEffectif: string;

  @IsString()
  nomComplet: string;

  @IsBoolean()
  siegeSocial: boolean;

  @IsString()
  siret: string;

  @IsEnum(['diffusible', 'partiellement_diffusible', 'non_diffusible'])
  statutDiffusion: 'diffusible' | 'partiellement_diffusible' | 'non_diffusible';

  @IsString()
  @IsOptional()
  trancheEffectifs: string | null;

  @IsString()
  @IsOptional()
  trancheEffectifsUniteLegale: string | null;
}
