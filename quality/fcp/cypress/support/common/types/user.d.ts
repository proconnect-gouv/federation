export interface UserCredentials {
  idpId: string;
  password: string;
  userName: string;
}

export interface UserDetails {
  [key: string]: string;
}

export interface User {
  enabled: boolean;
  credentials: [UserCredentials];
  details: UserDetails;
}
