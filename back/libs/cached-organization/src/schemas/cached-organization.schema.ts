import { Document } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  strict: true,
  collection: 'cachedOrganizations',
  timestamps: true,
})
export class CachedOrganization extends Document {
  @Prop({ type: String })
  siret: string;

  @Prop({ type: Object })
  organizationInfo: any;

  @Prop({ type: Date })
  updatedAt: Date;
}

const CachedOrganizationSchema =
  SchemaFactory.createForClass(CachedOrganization);

CachedOrganizationSchema.index(
  {
    siret: 1,
  },
  { unique: true },
);

export { CachedOrganizationSchema };
