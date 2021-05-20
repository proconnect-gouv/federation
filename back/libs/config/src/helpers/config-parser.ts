import { readFileSync } from 'fs';
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

  boolean(path: string): boolean {
    const fullPath = this.getFullPath(path);
    return parseBoolean(this.source[fullPath]);
  }

  json(path: string): any {
    const fullPath = this.getFullPath(path);
    return parseJsonProperty(this.source, fullPath);
  }

  string(path: string): string {
    const fullPath = this.getFullPath(path);
    return this.source[fullPath];
  }

  number(path: string): number {
    const fullPath = this.getFullPath(path);
    return parseInt(this.source[fullPath], 10);
  }

  file(path: string): string {
    const fullPath = this.getFullPath(path);
    const filePath = this.source[fullPath];

    return readFileSync(filePath).toString('utf8');
  }
}
