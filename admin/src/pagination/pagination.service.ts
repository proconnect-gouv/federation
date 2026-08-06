import { escapeRegExp } from "lodash";
import { PaginationFieldSearchType, PaginationOptions } from "./interface";

export class PaginationService {
  buildPaginationParams(options: PaginationOptions) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;
    const take = limit;

    let where = {};
    if (options.search) {
      const searchCriteria = [];
      for (const field of options.search.fields) {
        const searchCriterion = this.computeSearchCriterion(
          field,
          options.search.value,
        );
        if (!!searchCriterion) {
          searchCriteria.push({
            ...searchCriterion,
          });
        }
      }
      if (searchCriteria.length === 1) {
        where = searchCriteria[0];
      } else if (searchCriteria.length > 1) {
        where = { $or: searchCriteria };
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

  computeSearchCriterion(field: PaginationFieldSearchType, value: string) {
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
