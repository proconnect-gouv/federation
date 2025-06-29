export interface ExceptionDocumentationInterface {
  code: string | number;
  scope: number;
  errorCode: string;
  ERROR: string;
  ERROR_DESCRIPTION: string;
  UI: string;
  documentation: string;
  exception: string;
  http_status_code: number;
  translated?: string;
  LOG_LEVEL: number;
  path: string;
}
