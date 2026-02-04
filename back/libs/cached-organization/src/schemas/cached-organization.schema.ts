import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  strict: true,
  collection: 'cachedOrganizations',
  timestamps: true,
})
export class CachedOrganization extends Document {
  @Prop({ type: String, default: uuid })
  declare id: string;

  @Prop({ type: String })
  siret: string;
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
