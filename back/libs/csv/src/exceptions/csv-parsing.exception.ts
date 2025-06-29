import { ErrorCode } from '../enums';
import { CsvBaseException } from './csv-base.exception';

export class CsvParsingException extends CsvBaseException {
  public code = ErrorCode.PARSING_CSV;
  public documentation = "Problème d'extraction des données CSV";
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'Csv.exceptions.csvParsing';
}
