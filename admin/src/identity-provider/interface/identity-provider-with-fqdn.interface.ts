import { IdentityProviderFromDb } from '../identity-provider.mongodb.entity';

export interface IdentityProviderWithFqdn extends IdentityProviderFromDb {
  fqdns: string[];
}
