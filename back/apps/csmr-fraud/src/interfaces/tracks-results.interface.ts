/* istanbul ignore file */

// Declarative code
export interface TracksTicketDataInterface {
  accountIdMatch: boolean;
  platform: string;
  idpName: string;
  spName: string;
  date: string;
  city: string;
  country: string;
}

export interface TracksResultsInterface {
  tracks: TracksTicketDataInterface[];
  error: string;
  total: number;
}
