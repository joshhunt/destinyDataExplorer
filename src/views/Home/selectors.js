import { createSelector } from 'reselect';

import search from 'src/lib/search';

const MAX_RESULTS = 150;

export const filteredItemsSelector = createSelector(
  state => state.filter.searchString,
  state => state.definitions,
  (searchString, definitions) => {
    if (
      !searchString ||
      searchString.length < 3 ||
      !definitions ||
      !definitions.DestinyInventoryItemDefinition
    ) {
      return {};
    }

    const payload = {};
    payload.results = search(searchString, definitions);
    payload.allResults = payload.results;

    if (payload.results.length > MAX_RESULTS) {
      payload.results = payload.results.slice(0, MAX_RESULTS);
    } else if (payload.results.length === 0) {
      payload.noResults = true;
    }

    return payload;
  }
);
