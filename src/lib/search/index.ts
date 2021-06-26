import { makeAllDefsArray } from "../destinyUtils";
import SEARCH_FUNCTIONS, { phraseFn } from "./searchFns";

import { FILTERS } from "lib/search/guiSearchFilters";
import { AllDestinyManifestComponents } from "bungie-api-ts/destiny2/manifest";

export default function search(
  searchTerm: string,
  filterOptions: Record<any, any>,
  definitions: AllDestinyManifestComponents
) {
  const allDefs = makeAllDefsArray(definitions);
  const queries = searchTerm ? tokenize(searchTerm) : [];

  let results = allDefs;

  for (const query of queries) {
    if (query.type === "fn") {
      const searchFn = SEARCH_FUNCTIONS.find((v) => v.fnName === query.name);

      if (!searchFn) {
        continue;
      }

      const arg = searchFn.parseValueAsNumber
        ? parseInt(query.value, 10)
        : query.value;

      results = results.filter((obj) => searchFn.filterFn(obj, arg));
    }

    if (query.type === "phrase") {
      results = results.filter((obj) => phraseFn(obj, query.value));
    }
  }

  const filterOptionsArr = Object.entries(filterOptions).map(
    ([key, value]) => ({ key, value })
  );

  results = filterOptionsArr.reduce((acc, filterOptionSet) => {
    const filterDef = FILTERS.find((f) => f.id === filterOptionSet.key);

    if (!filterDef) {
      return acc;
    }

    return acc.filter((obj) => filterDef.searchFn(obj, filterOptionSet.value));
  }, results);

  return results;
}

const LAST_WORD_RE = /(?<previous>[\w\s]+)\s(?<fnName>\w+)$/;

interface SearchFnExpression {
  type: "fn";
  name: string;
  value: string;
}

interface SearchPhraseExpression {
  type: "phrase";
  value: string;
}

type SearchExpression = SearchFnExpression | SearchPhraseExpression;

export function tokenize(input: string) {
  const results: SearchExpression[] = [];

  let index = 0;
  let current = "";

  let isInFn = false;
  let isInQuotes = false;

  let currentFnName: string | null = null;

  const finishPhrase = (phrase: string) =>
    results.push({ type: "phrase", value: phrase.trim() });

  const newFn = (name: string) => (currentFnName = name);

  const finishFnWithValue = (value: string) => {
    if (!currentFnName) {
      throw new Error("Attempting to finish invalid function");
    }

    results.push({ type: "fn", name: currentFnName, value });
    currentFnName = null;
  };

  while (index < input.length) {
    const char = input[index];

    if (char === ":") {
      // If we have multiple words in current, then we ned to get just the last one for the fn name
      const match = current.match(LAST_WORD_RE);
      const previousPhrase = match?.groups?.previous;
      const fnName = match?.groups?.fnName;

      if (previousPhrase && fnName) {
        finishPhrase(previousPhrase);
        newFn(fnName);
      } else {
        newFn(current);
      }

      isInFn = true;
      current = "";
    } else if (char === " " && isInFn && !isInQuotes) {
      finishFnWithValue(current);
      current = "";
      isInFn = false;
    } else if (char === '"') {
      if (isInQuotes && isInFn) {
        isInQuotes = false;
        isInFn = false;
        finishFnWithValue(current);
        current = "";
      } else if (isInQuotes) {
        isInQuotes = false;
        finishPhrase(current);
        current = "";
        // } else if (!isInQuotes && isInFn) {
        //   isInQuotes = true;
      } else {
        isInQuotes = true;
      }
    } else {
      current += char;
    }

    index += 1;
  }

  if (isInFn) {
    finishFnWithValue(current);
  } else if (current.length) {
    finishPhrase(current);
  }

  return results;
}
