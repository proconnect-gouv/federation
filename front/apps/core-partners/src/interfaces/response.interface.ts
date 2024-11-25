/* istanbul ignore file */

// declarative file
export interface ResponseInterface<PayloadType> {
  type: 'VERSION';
  payload: PayloadType;
}
