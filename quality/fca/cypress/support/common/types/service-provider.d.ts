export interface ServiceProviderBase {
  redirectUriPath: string;
  selectors: {
    fcaButton: string;
    logoutButton: string;
  };
  url: string;
}

export interface ServiceProvider extends ServiceProviderBase {
  acrValue: string;
  authorizeHttpMethod: 'post' | 'get';
  mocked: boolean;
  name: string;
  scopes: string[];
  description: string;
}

export interface ScopeContext {
  scopes: string[];
  type: string;
}
