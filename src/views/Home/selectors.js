import { createSelector } from "reselect";

const MAX_RESULTS = 150;

export const filteredItemsSelector = createSelector(
  (state) => state.filter.searchString,
  (state) => state.filter,
  (state) => state.definitions.definitions,
  (state) => state.filter.results,
  (searchString, filterOptions, definitions, results) => {
    const hasSearchQuery =
      (searchString && searchString.length > 2) ||
      Object.keys(filterOptions).length > 0;

    if (
      !hasSearchQuery ||
      !definitions ||
      !definitions.DestinyInventoryItemDefinition ||
      !results
    ) {
      return {};
    }

    const mappedResults = results
      .map((obj) => ({
        ...obj,
        def: definitions[obj.type] && definitions[obj.type][obj.key],
      }))
      .filter((obj) => obj.def);

    const payload = {};
    payload.results = mappedResults;
    payload.allResults = payload.results;

    if (payload.results.length > MAX_RESULTS) {
      payload.results = payload.results.slice(0, MAX_RESULTS);
    } else if (payload.results.length === 0) {
      payload.noResults = true;
    }

    return payload;
  }
);
