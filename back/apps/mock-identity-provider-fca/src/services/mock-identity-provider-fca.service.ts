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
     * @todo Config this path
     */
    const databasePath = './data/database-mock.csv';
    const absolutePath = path.join(__dirname, databasePath);

    try {
      this.logger.debug('Loading database...');
      const data = await this.csvdbProxy(absolutePath, {
        rtrim: true,
      });

      this.database = data.rows;
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

  getIdentity(inputUid: string): Identity {
    const identity: Identity = this.database.find(
      ({ uid }) => uid === inputUid,
    );

    return identity;
  }
}
