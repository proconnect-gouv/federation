import { ObjectId } from 'mongodb';
import { FqdnToProvider } from '../fqdn-to-provider.mongodb.entity';

function createFqdnToProvider(
  partial: Partial<FqdnToProvider>,
): FqdnToProvider {
  return {
    _id: new ObjectId('68a30acf6cb39008b0015ab4'),
    acceptsDefaultIdp: true,
    fqdn: 'default.fqdn.com',
    identityProvider: 'mon-id-1',
    ...partial,
  };
}

const fqdnToProviderFactory = {
  createFqdnToProvider,
};

export { fqdnToProviderFactory };
