import { sortBy } from './pagination-sort.enum';
import { IOptions } from './interface/options-query-mongodb.interface';
import { aggregateProjectTagName } from './aggregate.constants';

/**
 *
 * NOTE:
 * We use an aggregate because on the prod server,
 * We have a version of mongod that does not support
 * The higher order function 'collation' => crash of the application.
 *
 */

async function paginate(query, route, options: IOptions) {
  let items = [];
  const { page, limit } = options;
  const total = await this.countDocuments(query);
  const pipeline = createPipelineAggregate(options);

  items = await this.aggregate(pipeline);

  const pageCount = Math.ceil(total / (limit || options.defaultLimit));
  const nextPage = Math.min(page + 1, pageCount);
  const previousPage = Math.max(page - 1, 1);

  return {
    items,
    itemCount: items.length,
    total,
    pageCount,
    next: page === pageCount ? '' : `${route}?page=${nextPage}`,
    previous: page === 1 ? '' : `${route}?page=${previousPage}`,
  };
}

/**
 *
 * NOTE:
 * We build our aggregate according to the field name
 * Because we must put this field in lowercase to be able to sort
 * It in alphabetical order
 *
 */

const createPipelineAggregate = options => {
  let userEntry;
  const { sort, action, page = 1, limit = 10, userSearch } = options;

  const sortTags = createAggregateTagSort(sort, action);
  if (userSearch && userSearch !== 'undefined') {
    const escapedUserSearch = userSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    userEntry = new RegExp(escapedUserSearch, 'i');
  }

  const aggregate = [
    {
      $match: {
        $or: [
          {
            key: userEntry,
          },
          {
            clientID: userEntry,
          },
          {
            client_id: userEntry,
          },
          {
            name: userEntry,
          },
          {
            title: userEntry,
          },
          {
            signup_id: userEntry,
          },
        ],
      },
    },
    sortTags,
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];
  if (sort === sortBy.NAME) {
    return [aggregateProjectTagName, ...aggregate];
  }

  return aggregate;
};

/**
 *
 * NOTE:
 * We build our 'sort' command to be able to manage the name
 * Field in addition to other fields that can be sorted
 *
 */

const createAggregateTagSort = (field = '_id', action) => {
  // output => case-insensitive query (using $toLower) ( only for the field name )
  const fld = field === sortBy.NAME ? sortBy.OUTPUT : field;

  const act = action === sortBy.ASC ? 1 : -1;
  return {
    $sort: { [fld]: act },
  };
};

export const paginatePlugin = schema => {
  schema.statics.paginate = paginate;
};
