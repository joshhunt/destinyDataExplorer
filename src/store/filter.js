import { pickBy } from "lodash";

import search from "src/lib/workerSearch";
import { makePayloadAction } from "./utils";

export const SET_FILTER_STRING = "Set filter string";
export const SET_FILTER_VALUE = "Set filter value";
export const SET_SEARCH_RESULTS = "Set search results";

export default function filterReducer(state = {}, { type, payload }) {
  switch (type) {
    case SET_FILTER_STRING: {
      return {
        ...state,
        searchString: payload
      };
    }

    case SET_SEARCH_RESULTS: {
      return {
        ...state,
        results: payload
      };
    }

    case SET_FILTER_VALUE: {
      const draft = {
        ...state,
        ...payload
      };

      const final = pickBy(draft, value => {
        return value !== null && value !== "null";
      });

      return final;
    }

    default:
      return state;
  }
}

// export const setFilterString = makePayloadAction(SET_FILTER_STRING);
export const setFilterValue = makePayloadAction(SET_FILTER_VALUE);

export const setFilterString = filterString => {
  return (dispatch, getState) => {
    const state = getState();

    dispatch({
      type: SET_FILTER_STRING,
      payload: filterString
    });

    window.requestAnimationFrame(() => {
      search(filterString, state.definitions)
        .then(results => {
          dispatch({
            type: SET_SEARCH_RESULTS,
            payload: results
          });
        })
        .catch(err => console.error(err));
    });
  };
};
