/**
 * @todo #339 Implement real data retrieval
 *
 * This mocked data will be removed in #339
 */
import { mockedData } from './temp-mock-tracks-data';

export class CsmrTracksService {
  async getList(_identity: unknown) {
    return JSON.stringify(mockedData);
  }
}
