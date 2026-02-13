import fs from 'fs';

import ejs from 'ejs';
import glob from 'glob';
import { pathToFileURL } from 'node:url';

import { HttpStatus } from '@nestjs/common';

import { BaseException } from '../../exceptions/base.exception';
import { getCode } from '../../helpers';
import {
  ExceptionClass,
  ExceptionDocumentationInterface,
  PathAndException,
  PathAndInstantiatedException,
  ValidExceptionParams,
} from '../../types';
import MarkdownGenerator from './markdown-generator';

const OIDC_PROVIDER_RUNTIME_SCOPE = 4;

export default class Runner {
  static extractException(args: {
    path: string;
    module: ExceptionClass;
  }): PathAndException | undefined {
    const Exception: typeof BaseException | undefined = Object.values(
      args.module,
    ).find((property) =>
      BaseException.prototype.isPrototypeOf(property.prototype),
    );

    if (!Exception) {
      return undefined;
    }

    return { path: args.path, Exception };
  }

  static hasValidNumber(param: number): boolean {
    return typeof param === 'number' && param >= 0;
  }

  static hasValidString(param: string): boolean {
    return (
      typeof param === 'string' &&
      param !== null &&
      param !== undefined &&
      param.trim() !== ''
    );
  }

  static hasValidHttpStatusCode(param: number): boolean {
    return (
      typeof param === 'number' && Object.values(HttpStatus).includes(param)
    );
  }

  static hasValidException({
    hasValidScope,
    hasValidCode,
    hasValidHttpStatusCode,
  }: ValidExceptionParams): boolean {
    return hasValidScope && hasValidCode && hasValidHttpStatusCode;
  }

  static inflateException({
    path,
    Exception,
  }: PathAndException): PathAndInstantiatedException | null {
    const { http_status_code, scope, code } = new Exception();

    // Retrieve static error and error description props
    const hasValidScope = Runner.hasValidNumber(scope);
    const hasValidCode = typeof code === 'number' || typeof code === 'string';
    const hasValidHttpStatusCode =
      Runner.hasValidHttpStatusCode(http_status_code);

    const isException = Runner.hasValidException({
      hasValidScope,
      hasValidCode,
      hasValidHttpStatusCode,
    });

    if (!isException) return null;

    return {
      path,
      Exception,
    };
  }

  static buildException({
    path,
    Exception,
  }: PathAndInstantiatedException): ExceptionDocumentationInterface {
    const { error, error_description, http_status_code, scope, code } =
      new Exception();

    const errorCode = getCode(scope, code, '');

    const data = {
      scope,
      code,
      errorCode,
      exception: Exception.name,
      http_status_code,
      path,
      error,
      error_description,
    };

    return data;
  }

  static async loadExceptions(
    paths: string[],
  ): Promise<ExceptionDocumentationInterface[]> {
    const infos = paths.map((p) => import(pathToFileURL(p).pathname));

    const modules = await Promise.all(infos);

    return modules
      .map((module, index) => ({ path: paths[index], module }))
      .map(Runner.extractException)
      .filter((Exception) => Boolean(Exception))
      .map(Runner.inflateException)
      .filter(Boolean)
      .map(Runner.buildException);
  }

  static getExceptionsFilesPath(basePaths: string[], searchPattern: string) {
    const paths: string[] = [];
    for (const basePath of basePaths) {
      const pattern = `${basePath}${searchPattern}`;
      const relativePaths = glob.sync(pattern);
      for (const relativePath of relativePaths) {
        paths.push(relativePath);
      }
    }

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
    const paths = Runner.getExceptionsFilesPath(
      ['libs', 'apps'],
      '/**/*.exception.ts',
    );
    const loaded = await Runner.loadExceptions(paths);

    const mainList = loaded.filter(
      (item) => item.scope !== OIDC_PROVIDER_RUNTIME_SCOPE,
    );

    const mainMarkdown = MarkdownGenerator.generate(mainList);

    const inputFile = `${__dirname}/view/erreurs.ejs`;
    const projectRootPath = '../';

    const mainPage = await Runner.renderFile(inputFile, {
      markdown: mainMarkdown,
      projectRootPath,
      title: 'Codes d’erreur généraux',
    });

    fs.writeFileSync('_doc/erreurs.md', mainPage);
  }
}
