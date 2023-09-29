import { join } from 'path';

export function getCwdForDirectory(directory: string): string {
  const pathDirectory = join(process.cwd(), '..', directory);
  return pathDirectory;
}
