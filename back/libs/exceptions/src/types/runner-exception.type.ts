import { BaseException } from '@fc/base-exception';

export type PathAndException = {
  path: string;
  Exception: typeof BaseException | undefined;
};

export type ExceptionClass = {
  [key: string]: typeof BaseException;
};

export type PathAndInstantiatedException = {
  path: string;
  Exception: typeof BaseException;
};

export type ValidExceptionParams = {
  hasValidScope: boolean;
  hasValidCode: boolean;
  hasValidHttpStatusCode: boolean;
};
