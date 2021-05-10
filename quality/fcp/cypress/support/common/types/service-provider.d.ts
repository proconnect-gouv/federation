export interface ServiceProviderBase {
  selectors: {
    fcButton: string;
    logoutButton: string;
  };
  url: string;
}

export interface ServiceProvider extends ServiceProviderBase {
  acrValue: string;
  name: string;
  scopes: [string];
}

export interface Scope {
  attributes: [string];
}
