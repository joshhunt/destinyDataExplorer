import { makeAllDefsArray } from './destinyUtils';
import SEARCH_FUNCTIONS from './searchFns';
import normalizeText from 'normalize-text';

import { FILTERS } from 'src/components/Filters';

const last = arr => arr[arr.length - 1];
// const INCLUDE_CLASSIFIED = 'include:classified';

export const matches = (string, searchTerm) => {
  return (
    string && string.toLowerCase && normalizeText(string).includes(searchTerm)
  );
};

const fallbackSearchFunction = {
  filterFn: (obj, searchTerm, comparableSearchTerm) => {
    const displayName =
      obj.def && obj.def.displayProperties && obj.def.displayProperties.name;

    return (
      obj.key === searchTerm ||
      matches(obj.type, comparableSearchTerm) ||
      matches(displayName, comparableSearchTerm) ||
      matches(obj.def.statId, comparableSearchTerm) ||
      matches(obj.def.statName, comparableSearchTerm)
    );
  }
};

export default function search(_searchTerm, filterOptions, definitions) {
  const allDefs = makeAllDefsArray(definitions);
  const searchTerm = _searchTerm && _searchTerm.toLowerCase();
  const queries = searchTerm && tokenize(searchTerm);

  let results = allDefs;

  if (queries) {
    results = queries.reduce((acc, query) => {
      let searchFn = SEARCH_FUNCTIONS.find(searchFn =>
        query.match(searchFn.regex)
      );

      let params = [];

      if (searchFn) {
        const match = query.match(searchFn.regex);
        const param = match[1];
        param && params.push(searchFn.parseInt ? parseInt(param, 10) : param);
      } else {
        const comparableQuery = query.toLowerCase();
        searchFn = fallbackSearchFunction;
        params = [query, comparableQuery];
      }

      return acc.filter(obj => searchFn.filterFn(obj, ...params));
    }, allDefs);
  }

  const filterOptionsArr = Object.entries(filterOptions).map(
    ([key, value]) => ({ key, value })
  );

  console.log({ filterOptionsArr });

  results = filterOptionsArr.reduce((acc, filterOptionSet) => {
    const filterDef = FILTERS.find(f => f.id === filterOptionSet.key);

    if (!filterDef) {
      return acc;
    }

    return acc.filter(obj => filterDef.searchFn(obj, filterOptionSet.value));
  }, results);

  return results;
}

function push(arr, thing) {
  arr.push(thing);
  return arr;
}

export function tokenize(searchTerm) {
  const phrases = searchTerm.split(' ').filter(s => s.length > 0);
  const collection = [];

  let running = true;
  let index = 0;

  while (running) {
    const word = phrases[index];

    if (!word) {
      running = false;
      break;
    }

    push(collection, word);

    if (word.includes(':')) {
      index += 1;
      continue; // return and run the next iteration
    }

    let innerIndex = index + 1;
    let innerRunning = true;

    while (innerRunning) {
      const innerWord = phrases[innerIndex];

      if (!innerWord) {
        innerRunning = false;
        break;
      }

      if (innerWord.includes(':')) {
        innerRunning = false;
        break;
      }

      const lastWord = last(collection);
      collection[collection.length - 1] = `${lastWord} ${innerWord}`;
      innerIndex += 1;
    }

    index = innerIndex;
  }

  return collection;
}
