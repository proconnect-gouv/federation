export interface ServiceProvider {
  name: string;
  descriptions: string[];
  clientId?: string;
  url: string;
  userinfo_signed_response_alg: string | null;
}
