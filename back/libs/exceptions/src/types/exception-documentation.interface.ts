export interface ExceptionDocumentationInterface {
  code: string | number;
  scope: number;
  errorCode: string;
  error: string;
  error_description: string;
  ui: string;
  documentation: string;
  exception: string;
  http_status_code: number;
  translated?: string;
  path: string;
}
