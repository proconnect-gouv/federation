export interface ServiceProviderBase {
  redirectUriPath: string;
  selectors: {
    fcButton: string;
    logoutButton: string;
  };
  url: string;
}

export interface ServiceProvider extends ServiceProviderBase {
  acrValue: string;
  name: string;
  mocked: boolean;
  scopes: string[];
}

export interface ScopeContext {
  scopes: string[];
  type: string;
}
