import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import { FilesName } from '../enums';
import { SearchDbCountryInterface } from '../interface';
import { generateCsvContent, readCSV, saveCsvToFile } from './csv.helper';
import * as ModuleUnderTest from './csv.helper';
import { getCwdForDirectory } from './utils.helper';

jest.mock('path');
jest.mock('fs');
jest.mock('./utils.helper');

describe('readCSV', () => {
  const createReadStreamMock = jest.mocked(createReadStream);

  it('should read the CSV file and resolve with results', async () => {
    // Given
    const csvFilePath = '../fixture/test.csv';
    const expectedResult = [{ col1: 'value1', col2: 'value2' }];
    const mockReadStream = {
      pipe: jest.fn().mockReturnThis(),
      on: jest.fn((event, callback) => {
        if (event === 'data') {
          callback({ col1: 'value1', col2: 'value2' }); // Mock des données
        } else if (event === 'end') {
          callback();
        } else if (event === 'error') {
          callback(new Error('Mocked error'));
        }
        return mockReadStream;
      }),
    };

    createReadStreamMock.mockReturnValue(mockReadStream);

    // When
    const result = await readCSV(csvFilePath);

    // Then
    expect(result).toEqual(expectedResult);
  });

  it('should reject with an error if the CSV file reading fails', async () => {
    // Given
    const csvFilePath = '../fixure/nonexistent.csv';
    const mockReadStream = {
      pipe: jest.fn().mockReturnThis(),
      on: jest.fn((event, callback) => {
        if (event === 'error') {
          callback(new Error('Mocked error'));
        }
        return mockReadStream;
      }),
    };

    createReadStreamMock.mockReturnValue(mockReadStream);

    // When / Then
    await expect(readCSV(csvFilePath)).rejects.toThrowError('Mocked error');
  });
});

describe('generateCsvContent', () => {
  it('should create a valid CSV content from an array of objects', () => {
    // Given
    const data = [
      { col1: 'value1', col2: 'value2' },
      { col1: 'value3', col2: 'value4' },
    ] as unknown as SearchDbCountryInterface[];

    const expectedCSVContent =
      '"col1","col2"\n"value1","value2"\n"value3","value4"';

    // When
    const csvContent = generateCsvContent(data);

    // Then
    expect(csvContent).toEqual(expectedCSVContent);
  });

  it('should handle undefined values in the data', () => {
    // Given
    const data = [
      { col1: 'value1', col2: undefined },
      { col1: undefined, col2: 'value2' },
    ] as unknown as SearchDbCountryInterface[];

    const expectedCSVContent = '"col1","col2"\n"value1",""\n"","value2"';

    // When
    const csvContent = generateCsvContent(data);

    // Then
    expect(csvContent).toEqual(expectedCSVContent);
  });
});

describe('saveCsvToFile', () => {
  let consoleLogSpy;
  const targetDirectory = '/path/to/target';
  const filePath = '/path/to/target/country.csv';
  const fileContent =
    '"cog","name","arr"\n"123","City1","Arr1"\n"456","City2","Arr2"\n';

  const dataMock = [
    {
      cog: 99101,
      name: 'libcog',
      oldName: 'ancom',
      geographicCode: 'crpay',
      oldGeographicCode: 'capay',
    },
  ] as unknown as SearchDbCountryInterface[];

  const existsSyncMock = jest.mocked(existsSync);
  const mkdirSyncMock = jest.mocked(mkdirSync);
  const writeFileSyncMock = jest.mocked(writeFileSync);
  const joinMock = jest.mocked(join);
  const getCwdForDirectoryMock = jest.mocked(getCwdForDirectory);

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    getCwdForDirectoryMock.mockReturnValue(targetDirectory);
    existsSyncMock.mockReturnValue(false);
    joinMock.mockReturnValue(filePath);

    jest
      .spyOn(ModuleUnderTest, 'generateCsvContent')
      .mockImplementation(() => fileContent);

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  it('should call getCwdForDirectory', () => {
    //When
    saveCsvToFile(dataMock, filePath);

    // Then
    expect(getCwdForDirectoryMock).toHaveBeenCalledExactlyOnceWith(filePath);
  });

  it('should call generateCsvContent', () => {
    //When
    saveCsvToFile(dataMock, filePath);

    // Then
    expect(ModuleUnderTest.generateCsvContent).toHaveBeenCalledTimes(1);
    expect(ModuleUnderTest.generateCsvContent).toHaveBeenCalledWith(dataMock);
  });

  it('should verify and create target directory if not existing', () => {
    //When
    saveCsvToFile(dataMock, filePath);

    // Then
    expect(existsSyncMock).toHaveBeenCalledWith(targetDirectory);
    expect(mkdirSyncMock).toHaveBeenCalledWith(targetDirectory, {
      recursive: true,
    });
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `Directory "${targetDirectory}" has been created`,
    );
  });

  it('should create csv file', () => {
    // Given
    const filenameCsv = FilesName.COUNTRY;

    existsSyncMock.mockReturnValue(true);

    //When
    saveCsvToFile(dataMock, filePath);

    // Then
    expect(writeFileSyncMock).toHaveBeenCalledWith(filePath, fileContent, {
      encoding: 'utf8',
    });
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `${filenameCsv} was created with success into ${filePath}`,
    );
  });
});
