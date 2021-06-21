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
  method: 'post' | 'get';
  mocked: boolean;
  name: string;
  scopes: string[];
  description: string;
}

export interface ScopeContext {
  scopes: string[];
  type: string;
}
