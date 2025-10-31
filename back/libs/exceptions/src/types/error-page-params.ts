export interface ErrorPageParams {
  error: {
    code?: string;
    id?: string;
    message?: string;
  };
  exceptionDisplay: {
    title?: string;
    description?: string;
    displayContact?: boolean;
    contactMessage?: string;
    contactHref?: string;
    illustration?: string;
  };
}
