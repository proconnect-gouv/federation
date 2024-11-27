import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import * as csvParser from 'csv-parser';

import { FilesName } from '../enums';
import { SearchDbCountryInterface } from '../interface';
import { getCwdForDirectory } from './utils.helper';

export function readCSV(csvFilePath: string): any {
  return new Promise((resolve, reject) => {
    const results = [];

    // Read the CSV file and convert to object array
    createReadStream(csvFilePath)
      .pipe(csvParser())
      .on('data', (row) => {
        results.push(row);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

export function generateCsvContent(data: SearchDbCountryInterface[]): string {
  const csvContent = [];
  const headers = Object.keys(data[0]);
  csvContent.push(headers.map((header) => `"${header}"`).join(','));

  data.forEach((item) => {
    // eslint-disable-next-line max-nested-callbacks
    const values = headers.map((header) =>
      item[header] !== undefined ? `"${item[header]}"` : '""',
    );
    csvContent.push(values.join(','));
  });

  return csvContent.join('\n');
}

export function saveCsvToFile(
  data: SearchDbCountryInterface[],
  folderDirectory: string,
): void {
  const targetDirectory = getCwdForDirectory(folderDirectory);
  const filenameCsv = FilesName.COUNTRY;
  // exports added for jest test mocked
  const fileContent = exports.generateCsvContent(data);

  if (!existsSync(targetDirectory)) {
    mkdirSync(targetDirectory, { recursive: true });
    console.log(`Directory "${targetDirectory}" has been created`);
  }

  const filePath = join(targetDirectory, filenameCsv);

  writeFileSync(filePath, fileContent, { encoding: 'utf8' });
  console.log(`${filenameCsv} was created with success into ${filePath}`);
}
