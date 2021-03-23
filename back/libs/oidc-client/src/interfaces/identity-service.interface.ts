export type TokenParams = {
  providerUid: string;
  idpState: string;
  idpNonce: string;
};

export type TokenResults = {
  accessToken: string;
  acr: string;
  amr?: string[];
};

export type UserInfosParams = {
  accessToken: string;
  providerUid: string;
};
