/* eslint-disable @typescript-eslint/no-var-requires */
const { DateTime } = require('luxon');
const { Client } = require('@elastic/elasticsearch');
const ejs = require('ejs');
const path = require('path');

const datamock = require('../tracks/account-traces.mock');
const placeholders = require('../enums/placeholders.enum');
const findFilesInDir = require('./helpers/findFilesInDir');

const ELASTIC_TRACKS_INDEX = process.env.Elasticsearch_TRACKS_INDEX;
const ELASTIC_NODES = JSON.parse(process.env.Elasticsearch_NODES);
const ELASTIC_USERNAME = process.env.Elasticsearch_USERNAME;
const ELASTIC_PASSWORD = process.env.Elasticsearch_PASSWORD;

// help to trace false logs generated in ES
const TRACE_MARK = '::mock::';

function debug(...data) {
  // eslint-disable-next-line no-console
  console.log(' * ', ...data);
}

// eslint-disable-next-line complexity
function extractDates(sequences) {
  let dates;
  try {
    // either a comma-separated string or a JSON array
    const values = /^\[.*\]$/.test(sequences)
      ? JSON.parse(sequences)
      : sequences.split(',');

    dates = values.map((value) =>
      DateTime.fromISO(value, { zone: 'utc' }).startOf('day'),
    );

    const areDates = dates.every((date) => date.isValid);
    if (!areDates) {
      throw new Error(`Invalid dates in sequences: ${sequences}`);
    }
  } catch (error) {
    throw new Error(
      `Sequences param must be a JSON array or comma-seperated dates: ${error.message}`,
    );
  }

  // Default value
  if (!dates.length) {
    dates = [DateTime.now().toUTC().startOf('day')];
  }
  return dates;
}

async function buildEventsFromLogs(id, raw) {
  const logs = raw
    .split('\n')
    .filter(Boolean)
    .map((log) => JSON.parse(log))
    .filter(({ accountId }) => accountId === id)
    .map((event) => ({
      ...event,
      '@version': TRACE_MARK, // traceur
    }));
  return logs;
}

function datesFromLimit(month = 6) {
  const now = DateTime.now().toUTC();
  const justBeforeNow = now.minus({ day: 1 });
  const justBefore = now.minus({ month }).plus({ day: 1 });
  const justAfter = now.minus({ month }).minus({ day: 1 });
  const dates = [justBeforeNow, justBefore, justAfter].map((date) =>
    date.toISODate(),
  );

  return dates;
}

/**
 * Start the populate script by instantiating the class:
 * > new PopulateAccountTraces();
 *
 * The class is instantiated at the bottom of these file.
 */
class PopulateAccountTraces {
  esClient;
  mock;

  constructor(datamock) {
    this.mock = datamock;
  }

  async run() {
    try {
      this.initElasticsearchClient();

      const formatedDatamock = this.getFormatedMockData();

      /**
       * @todo connect the new schema of data to the saving process.
       *
       * Author: Arnaud
       * Date: 24/02/2022
       */
      const accountId = 'test_TRACE_USER';
      const sequences = JSON.stringify(datesFromLimit(6));
      debug('Mock requested for', accountId, ' at ', sequences);

      const generatedDataMock = await this.generateMockData(
        accountId,
        sequences,
      );

      debug('Generated mocks: ', generatedDataMock);

      await this.deleteIndex();
      await this.setIndex();
      await this.save(formatedDatamock);

      await this.displayData();
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  /**
   * Setup the local elasticsearch database connection.
   *
   * @see https://localhost:9200
   * @see /fc-docker/compose/fc-core.yml:152
   * - Elasticsearch_PROTOCOL
   * - Elasticsearch_HOST
   * - Elasticsearch_PORT
   * - Elasticsearch_USERNAME
   * - Elasticsearch_PASSWORD
   * @returns {void}
   */
  initElasticsearchClient() {
    const [host] = ELASTIC_NODES || [];
    if (!Array.isArray(ELASTIC_NODES) || !ELASTIC_NODES[0]) {
      throw new Error(`Problem with connection params: ${host}`);
    }
    this.esClient = new Client({
      nodes: ELASTIC_NODES,
      auth: { username: ELASTIC_USERNAME, password: ELASTIC_PASSWORD },
    });
  }

  /**
   * Replace placeholders from data-mock by up-to-date info.
   *
   * @see https://moment.github.io/luxon/docs/class/src/datetime.js~DateTime.html#instance-method-plus
   * @returns {ICsmrTracksOutputTrack[]}
   */
  getFormatedMockData() {
    const formatedDataMock = this.mock.map((el) => {
      switch (el.date) {
        // -- expired date
        case placeholders.MORE_THAN_6_MONTHS:
          el.date = DateTime.now().minus({
            month: this.getRandomBetween(7, 11),
          });
          break;
        // -- valid date
        case placeholders.LESS_THAN_6_MONTHS:
          el.date = DateTime.now().minus({
            month: this.getRandomBetween(1, 5),
          });
          break;
      }
      return el;
    });

    console.log('PopulateAccountTraces.getFormatedMockData()', {
      formatedDataMock,
    });

    return formatedDataMock;
  }

  async generateMockData(accountId, sequences = '[]') {
    debug('Extract dates from request');
    const dates = extractDates(sequences);

    const directory = path.join(__dirname, '..', `/mocks`);
    debug(`Grab standard cinematic to mock in directory: ${directory}`);
    const paths = findFilesInDir(directory, /.*mock$/);

    debug(`Prepare mock order for ${dates.join(',')}`);
    const orders = dates.map((date, index) => [
      date.toMillis(),
      paths[index % paths.length],
    ]);

    debug(`Render ${orders.length} group of mocks`);
    const jobs = orders.map(([time, mock]) =>
      ejs.renderFile(mock, { accountId, time }),
    );
    const data = await Promise.all(jobs);

    debug(`Join ${data.length} group of generated mocks`);
    const raw = data.join('\n');

    debug('Parse logs from source');
    const logs = await buildEventsFromLogs(accountId, raw);

    return logs;
  }

  async deleteIndex() {
    try {
      await this.esClient.indices.delete({
        index: ELASTIC_TRACKS_INDEX,
      });
    } catch (error) {
      console.warn('PopulateAccountTraces.deleteIndex().catch()', error);
    }
  }

  async setIndex() {
    try {
      await this.esClient.indices.create(
        {
          index: ELASTIC_TRACKS_INDEX,
          body: {
            mappings: {
              properties: {
                event: { type: 'keyword' },
                spId: { type: 'text' },
                date: { type: 'date' },
                accountId: { type: 'text' },
                spName: { type: 'text' },
                spAcr: { type: 'keyword' },
                country: { type: 'keyword' },
                city: { type: 'keyword' },
              },
            },
          },
        },
        { ignore: [400] },
      );
    } catch (error) {
      console.warn('PopulateAccountTraces.setIndex().catch()', error);
    }
  }

  /**
   * save traces in elasticsearch.
   *
   * To display database traces:
   * @see http://localhost:9200/_cat/indices/
   * @link https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/examples.html
   *
   * @returns {boolean}
   */
  // eslint-disable-next-line complexity
  async save() {
    try {
      const header = { index: { _index: ELASTIC_TRACKS_INDEX } };
      const body = this.mock.flatMap((doc) => [header, doc]);

      const { body: bulkResponse } = await this.esClient.bulk({
        refresh: true,
        body,
      });

      // -- if an error occured
      if (bulkResponse.errors) {
        // eslint-disable-next-line max-depth
        if (erroredDocuments.length > 0) {
          console.warn('PopulateAccountTraces.save()', {
            error: 'Error while importing document',
            errors: bulkResponse.errors,
          });
        }
      }

      // -- control if the datamock have been correctly imported.
      const { body: total } = await this.esClient.count({
        index: ELASTIC_TRACKS_INDEX,
      });
      if (total.count !== this.mock.length) {
        console.warn('PopulateAccountTraces.save()', {
          error: 'All mocks were not imported',
          count: total.count,
          datamockLength: this.mock.length,
        });
      }
    } catch (error) {
      console.warn('PopulateAccountTraces.save().catch()', error);
    }

    return true;
  }

  async displayData() {
    let result;
    try {
      result = await this.esClient.cat.indices({ format: 'json' });

      console.log('PopulateAccountTraces.displayData()', {
        result: result.body,
      });
    } catch (error) {
      console.warn('PopulateAccountTraces.displayData().catch()', error);
    }
  }

  /**
   * Get a random integer between two values, inclusive:
   * The maximum is inclusive and the minimum is inclusive.
   *
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  getRandomBetween(min, max) {
    const _min = Math.ceil(min);
    const _max = Math.ceil(max);
    return Math.floor(Math.random() * (_max - _min) + _min);
  }
}

new PopulateAccountTraces(datamock).run();
