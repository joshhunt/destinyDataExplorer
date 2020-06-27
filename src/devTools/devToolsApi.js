import { filter as lodashFilter } from "lodash";

function filter(obj, fn) {
  const results = lodashFilter(obj, fn);

  results.show = () => {
    window.__show(results);
  };

  return results;
}

window.__filter = filter;
