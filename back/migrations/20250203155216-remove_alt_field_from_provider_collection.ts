//

import type { Db } from 'mongodb';

import type { IdentityProvider } from '@fc/identity-provider-adapter-mongo/schemas';

//

export async function up(db: Db) {
  await db
    .collection<IdentityProvider>('provider')
    .updateMany({ alt: { $exists: true } }, { $unset: { alt: '' } });
}
