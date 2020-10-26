import * as fs from 'fs';
import * as glob from 'glob';
import { Type } from '@nestjs/common';
import { ErrorService, FcException } from '@fc/error';
import * as ejs from 'ejs';

import { Description, Loggable, Trackable } from './../../decorator';
import MarkdownGenerator from './markdown-generator';
import { IExceptionDocumentation } from '@fc/error/interfaces';

export default class Runner {
  static extractException(module: {
    [key: string]: {
      new (...args: any[]): any;
    };
  }): Type<FcException> {
    return Object.values(module).find(
      (property) => property.prototype instanceof FcException,
    );
  }

  static inflateException(Exception: Type<FcException>) {
    const error = new Exception(new Error());
    const { scope, code } = error;
    const hasValidScope = typeof scope === 'number' && scope >= 0;
    const hasValidCode = typeof code === 'number' && code >= 0;
    const isException = hasValidScope && hasValidCode;
    if (!isException) return null;
    return error;
  }

  static buildException(errorInstance: FcException): IExceptionDocumentation {
    const { scope, code, message } = errorInstance;

    const errorCode = ErrorService.getCode(scope, code);
    const loggable = Loggable.isLoggable(errorInstance);
    const trackable = Trackable.isTrackable(errorInstance);
    const description = Description.getDescription(errorInstance);

    const data = {
      scope,
      code,
      errorCode,
      message,
      loggable,
      trackable,
      description,
    };
    return data;
  }

  static async loadExceptions(
    paths: string[],
  ): Promise<IExceptionDocumentation[]> {
    const infos = paths.map((path) => import(path));
    const modules = await Promise.all(infos);

    return modules
      .map(Runner.extractException)
      .filter(Boolean)
      .map(Runner.inflateException)
      .filter(Boolean)
      .map(Runner.buildException);
  }

  static getExceptionsFilesPath(
    basePath = '@(libs|apps)',
    searchPattern = '/**/*.exception.ts',
  ): string[] {
    const pattern = `${basePath}${searchPattern}`;
    const paths = glob.sync(pattern);
    return paths;
  }

  static renderFile(file: string, data: object): Promise<string> {
    return new Promise((resolve, reject) => {
      ejs.renderFile(file, data, (err: Error, result: string) => {
        if (err) return reject(err);
        return resolve(result);
      });
    });
  }

  static async run(): Promise<void> {
    console.log('Generating documentation for exceptions...');
    const paths = Runner.getExceptionsFilesPath();
    const loaded = await Runner.loadExceptions(paths);
    const markdown = MarkdownGenerator.generate(loaded);

    const inputFile = `${__dirname}/view/erreurs.ejs`;
    const page = await Runner.renderFile(inputFile, { markdown });
    fs.writeFileSync('_doc/erreurs.md', page);
  }
}
