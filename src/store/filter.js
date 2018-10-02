import { pickBy } from 'lodash';
import { makePayloadAction } from './utils';

export const SET_FILTER_STRING = 'Set filter string';
export const SET_FILTER_VALUE = 'Set filter value';

export default function filterReducer(state = {}, { type, payload }) {
  switch (type) {
    case SET_FILTER_STRING: {
      return {
        ...state,
        searchString: payload
      };
    }

    case SET_FILTER_VALUE: {
      const draft = {
        ...state,
        ...payload
      };

      const final = pickBy(draft, value => {
        return value !== null && value !== 'null';
      });

      console.log({ draft, final });

      return final;
    }

    default:
      return state;
  }
}

export const setFilterString = makePayloadAction(SET_FILTER_STRING);
export const setFilterValue = makePayloadAction(SET_FILTER_VALUE);
