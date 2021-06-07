export interface UserCredentials {
  idpId: string;
  password: string;
  username: string;
}

export interface UserClaims {
  [key: string]: string;
}

export interface User {
  enabled: boolean;
  credentials: [UserCredentials];
  claims: UserClaims;
}
