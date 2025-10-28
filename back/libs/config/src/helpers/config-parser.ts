import { existsSync, readFileSync } from 'fs';

import { isEmpty } from 'lodash';

import { parseBoolean, parseJsonProperty } from '@fc/common';

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

  string(path: string, undefinedIfEmpty: boolean = false): string | undefined {
    const fullPath = this.getFullPath(path);
    const value = this.source[fullPath];
    if (undefinedIfEmpty && isEmpty(value)) {
      return undefined;
    }
    return value;
  }

  stringArray(path: string): string[] {
    const parsedString = this.string(path, true);
    return parsedString?.split(',') || [];
  }

  number(path: string, undefinedIfEmpty: boolean = false): number {
    const fullPath = this.getFullPath(path);
    const value = this.source[fullPath];
    if (undefinedIfEmpty && isEmpty(value)) {
      return undefined;
    }
    return parseInt(this.source[fullPath], 10);
  }

  file(path: string, undefinedIfEmpty: boolean = false): string {
    const fullPath = this.getFullPath(path);
    const filePath = this.source[fullPath];

    const fileExists = existsSync(filePath);

    if (fileExists) {
      return readFileSync(filePath, 'utf-8');
    }

    if (undefinedIfEmpty) {
      return undefined;
    }

    throw new Error(`file at path ${filePath} is missing`);
  }
}
