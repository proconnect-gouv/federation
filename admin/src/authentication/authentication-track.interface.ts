import {
  AuthenticationActions,
  AuthenticationStates,
} from './authentication-actions.enum';

export interface IAuthenticationTrack {
  action: AuthenticationActions;
  state?: AuthenticationStates;
  user: string;
}
