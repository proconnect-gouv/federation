import * as path from 'path';
import csvdb from 'node-csv-query';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { Identity } from '../dto';

@Injectable()
export class MockIdentityProviderFcaService {
  private csvdbProxy = csvdb;

  private database: Identity[];

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name);
  }

  async onModuleInit() {
    return this.loadDatabase();
  }

  private async loadDatabase(): Promise<void> {
    /**
     * @todo #307 Config this path
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/307
     */
    const databasePath = './data/database-mock.csv';
    const absolutePath = path.join(__dirname, databasePath);

    try {
      this.logger.debug('Loading database...');
      const data = await this.csvdbProxy(absolutePath, {
        rtrim: true,
      });

      this.database = data.rows.map(this.removeEmptyColums);
    } catch (error) {
      this.logger.fatal(
        `Failed to load CSV database, path was: ${absolutePath}`,
      );
      throw error;
    }

    this.logger.debug(
      `Database loaded (${this.database.length} entries found)`,
    );
  }

  private removeEmptyColums(data: Identity): Identity {
    const cleanedData = {} as Identity;
    Object.entries(data).forEach(([key, value]) => {
      if (value && value !== '') {
        cleanedData[key] = value;
      }
    });

    return cleanedData;
  }

  getIdentity(inputUid: string): Identity {
    const identity: Identity = this.database.find(
      ({ uid }) => uid === inputUid,
    );

    return identity;
  }
}
