import { ErrorCode } from '../enums';
import { CsvBaseException } from './csv-base.exception';

export class CsvParsingException extends CsvBaseException {
  public code = ErrorCode.PARSING_CSV;
  public documentation = "Problème d'extraction des données CSV";
  static ERROR = 'server_error';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  static UI = 'Csv.exceptions.csvParsing';
}
