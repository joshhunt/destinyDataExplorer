import { pickBy } from 'lodash';
import md5 from 'blueimp-md5';

import { makePayloadAction } from './utils';

window.__md5 = md5;

export const SET_BULK_DEFINITIONS = 'Set bulk definitions';

export default function definitionsReducer(state = {}, { type, payload }) {
  switch (type) {
    case SET_BULK_DEFINITIONS: {
      const filtered = pickBy(payload, defs => defs);

      // if (md5(window.location.search) !== '0667ec7bd7d01ec391820d300bccc61b') {
      //   console.warn('---');
      //   delete filtered.DestinyCollectibleDefinition;
      // }

      return {
        ...state,
        ...filtered
      };
    }

    default:
      return state;
  }
}

export const setBulkDefinitions = makePayloadAction(SET_BULK_DEFINITIONS);
