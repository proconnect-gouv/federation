/* istanbul ignore file */

// declarative file
export interface UserInfosState {
  connected: boolean;
  userinfos: string;
}

export interface RootState {
  authorizeUrl: string;
  endSessionUrl: string;
  userInfos: UserInfosState;
}
