import { pickBy } from 'lodash';
import { makePayloadAction } from './utils';

export const SET_BULK_DEFINITIONS = 'Set bulk definitions';

export default function definitionsReducer(state = {}, { type, payload }) {
  switch (type) {
    case SET_BULK_DEFINITIONS: {
      const filteded = pickBy(payload, defs => defs);

      return {
        ...state,
        ...filteded
      };
    }

    default:
      return state;
  }
}

export const setBulkDefinitions = makePayloadAction(SET_BULK_DEFINITIONS);
