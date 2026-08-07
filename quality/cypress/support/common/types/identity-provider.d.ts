export interface IdentityProvider {
  descriptions: string[];
  attachedEmailDomain?: string;
  id: string;
  signature: string;
  title: string;
  url: string;
}
