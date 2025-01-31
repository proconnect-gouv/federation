import { existsSync, readFileSync } from 'fs';

import { parseBoolean, parseJsonProperty } from '@fc/common';

import {
  ConfigParserFileOptionsInterface,
  ConfigParserStringOptionsInterface,
} from '../interfaces';

export class ConfigParser {
  constructor(
    private readonly source: any,
    private readonly namespace: string,
    private readonly separator = '_',
  ) {}

  private getFullPath(path: string): string {
    return `${this.namespace}${this.separator}${path}`;
  }

  private exist(path: string): boolean {
    const fullPath = this.getFullPath(path);
    return this.source.hasOwnProperty(fullPath);
  }

  boolean(path: string): boolean {
    const fullPath = this.getFullPath(path);
    return parseBoolean(this.source[fullPath]);
  }

  json(path: string): any {
    if (!this.exist(path)) {
      return undefined;
    }
    const fullPath = this.getFullPath(path);
    return parseJsonProperty(this.source, fullPath);
  }

  string(
    path: string,
    options: ConfigParserStringOptionsInterface = {},
  ): string | undefined {
    const fullPath = this.getFullPath(path);
    const { undefinedIfEmpty } = options;
    const value = this.source[fullPath];
    if (undefinedIfEmpty && value === '') {
      return undefined;
    }
    return value;
  }

  number(path: string): number {
    const fullPath = this.getFullPath(path);
    return parseInt(this.source[fullPath], 10);
  }

  file(path: string, options: ConfigParserFileOptionsInterface = {}): string {
    const { optional } = options;

    const fullPath = this.getFullPath(path);
    const filePath = this.source[fullPath];

    const fileExists = existsSync(filePath);

    if (fileExists) {
      return readFileSync(filePath, 'utf-8');
    }

    if (optional) {
      return null;
    }

    throw new Error(`file at path ${filePath} is missing`);
  }

  get root(): ConfigParser {
    return new ConfigParser(this.source, '', '');
  }
}
