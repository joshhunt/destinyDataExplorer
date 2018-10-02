import { createSelector } from 'reselect';

import search from 'src/lib/search';

const MAX_RESULTS = 150;

export const filteredItemsSelector = createSelector(
  state => state.filter.searchString,
  state => state.filter,
  state => state.definitions,
  (searchString, filterOptions, definitions) => {
    const hasSearchQuery =
      (searchString && searchString.length > 2) ||
      Object.keys(filterOptions).length > 0;

    if (
      !hasSearchQuery ||
      !definitions ||
      !definitions.DestinyInventoryItemDefinition
    ) {
      return {};
    }

    const payload = {};
    payload.results = search(searchString, filterOptions, definitions);
    payload.allResults = payload.results;

    if (payload.results.length > MAX_RESULTS) {
      payload.results = payload.results.slice(0, MAX_RESULTS);
    } else if (payload.results.length === 0) {
      payload.noResults = true;
    }

    return payload;
  }
);
