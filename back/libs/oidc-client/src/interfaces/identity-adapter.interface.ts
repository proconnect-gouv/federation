export type TokenParams = {
  providerUid: string;
  idpState: string;
  idpNonce: string;
};

export type TokenResults = {
  accessToken: string;
  idToken: string;
  acr: string;
  amr?: string[];
};

export type UserInfosParams = {
  accessToken: string;
  providerUid: string;
};
