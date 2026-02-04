import { Document } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  strict: true,
  collection: 'cachedOrganizations',
  timestamps: true,
})
export class CachedOrganization extends Document {
  @Prop({ type: String, unique: true, index: true })
  siret: string;

  @Prop({ type: String })
  activitePrincipale: string;

  @Prop({ type: String })
  adresse: string;

  @Prop({ type: String })
  categorieJuridique: string;

  @Prop({ type: String })
  codeOfficielGeographique: string;

  @Prop({ type: String })
  enseigne: string;

  @Prop({ type: Boolean })
  estActive: boolean;

  @Prop({ type: Boolean })
  estDiffusible: boolean;

  @Prop({ type: String })
  etatAdministratif: string;

  @Prop({ type: String })
  libelle: string;

  @Prop({ type: String })
  libelleActivitePrincipale: string;

  @Prop({ type: String })
  libelleCategorieJuridique: string;

  @Prop({ type: String })
  libelleTrancheEffectif: string;

  @Prop({ type: String })
  nomComplet: string;

  @Prop({ type: Boolean })
  siegeSocial: boolean;

  @Prop({ type: String })
  statutDiffusion: 'partiellement_diffusible' | 'diffusible' | 'non_diffusible';

  @Prop({ type: String })
  codePostal?: string;

  @Prop({ type: Object })
  trancheEffectifs?: any;

  @Prop({ type: String })
  trancheEffectifsUniteLegale?: string;

  @Prop({ type: Date })
  updatedAt: Date;
}

const CachedOrganizationSchema =
  SchemaFactory.createForClass(CachedOrganization);

export { CachedOrganizationSchema };
