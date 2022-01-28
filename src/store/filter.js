import { pickBy } from "lodash";

import search from "lib/workerSearch";
import { makePayloadAction } from "./utils";

export const SET_FILTER_STRING = "Set filter string";
export const SET_FILTER_VALUE = "Set filter value";
export const SET_SEARCH_RESULTS = "Set search results";

const INITIAL_STATE = {
  filters: {},
};

export default function filterReducer(
  state = INITIAL_STATE,
  { type, payload }
) {
  switch (type) {
    case SET_FILTER_STRING: {
      return {
        ...state,
        searchString: payload,
      };
    }

    case SET_SEARCH_RESULTS: {
      return {
        ...state,
        results: payload,
      };
    }

    case SET_FILTER_VALUE: {
      const draft = {
        ...state,
        filters: {
          ...state.filters,
          ...payload,
        },
      };

      draft.filters = pickBy(draft.filters, (value) => {
        return value !== null && value !== "null";
      });

      return draft;
    }

    default:
      return state;
  }
}

const raf = () =>
  new Promise((resolve) => window.requestAnimationFrame(() => resolve()));

export function setSearchResults(results) {
  return {
    type: SET_SEARCH_RESULTS,
    payload: results,
  };
}

async function doSearch(dispatch, getState) {
  const state = getState();

  await raf();

  const searchPayload = {
    searchString: state.filter.searchString,
    filters: state.filter.filters,
  };

  const results = await search(searchPayload, state.definitions.definitions);

  dispatch(setSearchResults(results));
}

// export const setFilterString = makePayloadAction(SET_FILTER_STRING);
export const setFilterValue = (filterValue) => {
  return (dispatch, getState) => {
    dispatch(makePayloadAction(SET_FILTER_VALUE)(filterValue));
    doSearch(dispatch, getState);
  };
};

export const setFilterString = (searchString) => {
  return (dispatch, getState) => {
    dispatch(makePayloadAction(SET_FILTER_STRING)(searchString));
    doSearch(dispatch, getState);
  };
};
