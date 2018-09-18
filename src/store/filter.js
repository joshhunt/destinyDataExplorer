import { makePayloadAction } from './utils';

export const SET_FILTER_STRING = 'Set filter string';

export default function filterReducer(state = {}, { type, payload }) {
  switch (type) {
    case SET_FILTER_STRING: {
      return {
        ...state,
        searchString: payload
      };
    }

    default:
      return state;
  }
}

export const setFilterString = makePayloadAction(SET_FILTER_STRING);
