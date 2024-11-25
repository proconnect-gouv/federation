/* istanbul ignore file */

// declarative file
import { create } from './create';
import { loadAll } from './load-all';
import { loadSchema } from './load-schema';
import { read } from './read';
import { update } from './update';

export const VersionsService = {
  create,
  loadAll,
  loadSchema,
  read,
  update,
};
