import { parseBoolean, parseJsonProperty } from "@fc/common";
import { existsSync, readFileSync } from "fs";
import { isEmpty } from "lodash";

export class ConfigParser {
  constructor(
    private readonly source: any,
    private readonly namespace: string,
    private readonly separator = "_",
  ) {}

  private getFullPath(path: string): string {
    return `${this.namespace}${this.separator}${path}`;
  }

  private exist(path: string): boolean {
    const fullPath = this.getFullPath(path);
    return this.source.hasOwnProperty(fullPath);
  }

  boolean(path: string): boolean;
  boolean(path: string, undefinedIfEmpty: true): boolean | undefined;
  boolean(path: string, undefinedIfEmpty = false): boolean | undefined {
    const fullPath = this.getFullPath(path);
    const value = parseBoolean(this.source[fullPath]);
    if (value === undefined) {
      if (undefinedIfEmpty) return undefined;
      throw new Error(
        `Config "${fullPath}" is not a valid boolean (true/false expected)`,
      );
    }
    return value;
  }

  json(path: string): any {
    if (!this.exist(path)) {
      return undefined;
    }
    const fullPath = this.getFullPath(path);
    return parseJsonProperty(this.source, fullPath);
  }

  string(path: string): string;
  string(path: string, undefinedIfEmpty: boolean): string | undefined;
  string(path: string, undefinedIfEmpty = false): string | undefined {
    const fullPath = this.getFullPath(path);
    const value = this.source[fullPath];
    if (isEmpty(value)) {
      if (undefinedIfEmpty) return undefined;
      throw new Error(`Config "${fullPath}" is required but empty or missing`);
    }
    return String(value);
  }

  stringArray(path: string): string[] {
    const parsedString = this.string(path, true);
    return parsedString?.split(",") || [];
  }

  number(path: string): number;
  number(path: string, undefinedIfEmpty: true): number | undefined;
  number(path: string, undefinedIfEmpty = false): number | undefined {
    const fullPath = this.getFullPath(path);
    const value = this.source[fullPath];
    if (isEmpty(value)) {
      if (undefinedIfEmpty) return undefined;
      throw new Error(`Config "${fullPath}" is required but empty or missing`);
    }
    return parseInt(this.source[fullPath], 10);
  }

  file(path: string, undefinedIfEmpty: boolean = false): string | undefined {
    const fullPath = this.getFullPath(path);
    const filePath = this.source[fullPath];

    const fileExists = existsSync(filePath);

    if (fileExists) {
      return readFileSync(filePath, "utf-8");
    }

    if (undefinedIfEmpty) {
      return undefined;
    }

    throw new Error(`file at path ${filePath} is missing`);
  }
}
