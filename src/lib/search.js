import { memoize } from 'lodash';
import { makeAllDefsArray } from './destinyUtils';
import SEARCH_FUNCTIONS from './searchFns';
import normalizeText from 'normalize-text';

const getComparableName = memoize(item => {
  const name = item && item.displayProperties && item.displayProperties.name;
  return name ? normalizeText(name) : name;
});

const last = arr => arr[arr.length - 1];
// const INCLUDE_CLASSIFIED = 'include:classified';

const fallbackSearchFunction = {
  filterFn: (obj, searchTerm, comparableSearchTerm) => {
    const comparableName = getComparableName(obj.def);

    return (
      obj.key === searchTerm ||
      obj.type.toLowerCase().includes(comparableSearchTerm) ||
      (comparableName && comparableName.includes(comparableSearchTerm))
    );
  }
};

export default function search(_searchTerm, definitions) {
  if (_searchTerm.length < 3) {
    return [];
  }

  const allDefs = makeAllDefsArray(definitions);
  const searchTerm = _searchTerm.toLowerCase();
  let queries = tokenize(searchTerm); // eslint-disable-line

  // if (queries.includes(INCLUDE_CLASSIFIED)) {
  //   queries = queries.filter(q => q !== INCLUDE_CLASSIFIED);
  // } else {
  //   queries.push('not:classified');
  // }

  const results = tokenize(searchTerm).reduce((acc, query) => {
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
