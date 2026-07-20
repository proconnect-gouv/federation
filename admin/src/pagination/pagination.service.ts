import { escapeRegExp } from "lodash";
import { PaginationFieldSearchType, PaginationOptions } from "./interface";

export class PaginationService {
  buildPaginationParams(options: PaginationOptions) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;
    const take = limit;

    let where = {};
    if (options.search) {
      const orSearch = [];
      for (const field of options.search.fields) {
        const searchCriteria = this.computeSearchCriteria(
          field,
          options.search.value,
        );
        if (!!searchCriteria) {
          orSearch.push({
            ...searchCriteria,
          });
        }
      }
      if (orSearch.length === 1) {
        where = orSearch[0];
      } else if (orSearch.length > 1) {
        where = { $or: orSearch };
      }
    }

    let order;
    if (options.sort) {
      const { field, direction } = options.sort;
      order = {
        [field]: direction === "asc" ? "ASC" : "DESC",
      };
    }

    const params = { skip, take, where, order };

    return params;
  }

  computeSearchCriteria(field: PaginationFieldSearchType, value: string) {
    switch (field.searchKind) {
      case "contains":
        return { [field.name]: new RegExp(escapeRegExp(value), "i") };
      case "exactMatch":
        if (!field.pattern.test(value)) {
          return null;
        }
        return { [field.name]: value };
    }
  }
}
