/* istanbul ignore file */

// declarative code
import { ISessionGenericCookieOptions } from './session-generic-cookie-options.interface';

export interface ISessionGenericResponse {
  cookie(name: string, value: string, options: ISessionGenericCookieOptions);
}
