import Fuse from 'fuse.js';

import { FuseResult, Ministry } from '../../../types';

const FUSE_SEARCH_BASE_OPTIONS = {
  findAllMatches: false,
  ignoreLocation: true,
  includeMatches: true,
  includeScore: false,
  isCaseSensitive: false,
  keys: ['slug'],
  maxPatternLength: 64,
  minMatchCharLength: 3,
  shouldSort: true,
  threshold: 0.3,
};

const searchTheTermInside = (term: string) => (
  ministries: Ministry[],
): FuseResult[] | [] => {
  const fuse = new Fuse(ministries, FUSE_SEARCH_BASE_OPTIONS);
  const fuseResults = fuse.search(term);
  return fuseResults;
};

export default searchTheTermInside;
