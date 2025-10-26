import { TokenResultClaimsDto } from '../dto';

export type TokenParams = {
  state: string;
  nonce: string;
};

export type ExtraTokenParams = {
  [key: string]: string;
};

export type TokenResults = {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  claims: TokenResultClaimsDto;
};

export type UserInfosParams = {
  accessToken: string;
  idpId: string;
};
