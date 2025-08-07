/* istanbul ignore file */

// declarative file
export type Action =
  | 'create'
  | 'updatePassword'
  | 'enroll'
  | 'block'
  | 'delete';

export interface IUserTrack {
  action: Action;
  user: string;
  id?: string;
  name: string;
}
