import { Document } from 'mongoose';
import { v4 as uuid } from 'uuid';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  _id: false,
  collection: 'idpIdentityKeys',
})
class IdpIdentityKey {
  @Prop({ type: String })
  idpSub: string;

  @Prop({ type: String })
  idpUid: string;

  @Prop({ type: String })
  idpMail: string;
}

@Schema({
  strict: true,
  collection: 'accountFca',
  timestamps: true,
})
export class AccountFca extends Document {
  /**
   * Timestamping
   */
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: String, default: uuid })
  declare id: string;

  @Prop({ type: Date, default: Date.now, index: { expires: '3y' } })
  updatedAt: Date;

  @Prop({ type: Date, default: Date.now })
  lastConnection: Date;

  /**
   * Unique sub generated from uuid
   */
  @Prop({ type: String, unique: true })
  sub: string;

  /**
   * List of identity keys for each associtated idp
   * These keys are a concatenation of idp uuid and idp sub
   */
  @Prop({
    type: [IdpIdentityKey],
  })
  idpIdentityKeys: IdpIdentityKey[];

  /**
   * Active === true means it is not blocked by AC
   */
  @Prop({ type: Boolean, default: true })
  active: boolean;
}

const AccountFcaSchema = SchemaFactory.createForClass(AccountFca);

AccountFcaSchema.index(
  {
    'idpIdentityKeys.idpUid': 1,
    'idpIdentityKeys.idpSub': 1,
  },
  { unique: true },
);

AccountFcaSchema.index({
  'idpIdentityKeys.idpMail': 1,
  'idpIdentityKeys.idpUid': 1,
});

export { AccountFcaSchema };
