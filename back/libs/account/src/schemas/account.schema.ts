import * as mongoose from 'mongoose';

export const AccountSchema = new mongoose.Schema(
  {
    /**
     * Timestamping
     */
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now, index: { expires: '3y' } },
    lastConnection: { type: Date, default: Date.now },

    /**
     * Unique id generated from pivot identity
     */
    identityHash: { type: String, index: true },

    /**
     * Is this identity active, ie: not blocked by FC
     *
     * It coud be blocked through exploitation app, in case of suspected identoty thief
     */
    active: { type: Boolean, default: true },

    /**
     * Expected format : { [identityProviderId]: identityProviderUserSub, ... },
     * Stores keys (subs OpenIdConnect) for Identity Provider
     */
    idpFederation: Object,

    /**
     * Expected format : { [serviceProviderId]: serviceProviderUserSub, ... },
     * Stores keys (subs OpenIdConnect) for Service Provider
     */
    spFederation: Object,
  },
  {
    // Mongoose add 's' at the end of the collection name without this argument
    collection: 'account',
    strict: true,
    strictQuery: true,
  },
);
