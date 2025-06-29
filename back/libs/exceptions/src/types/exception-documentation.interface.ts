export interface ExceptionDocumentationInterface {
  code: string | number;
  SCOPE: number;
  errorCode: string;
  ERROR: string;
  ERROR_DESCRIPTION: string;
  UI: string;
  documentation: string;
  exception: string;
  HTTP_STATUS_CODE: number;
  translated?: string;
  LOG_LEVEL: number;
  path: string;
}
