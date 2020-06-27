import { filter as lodashFilter } from "lodash";

function filter(obj, fn) {
  const results = lodashFilter(obj, fn);

  return results;
}

window.__filter = filter;
