export const SET_BULK_DEFINITIONS = 'Set bulk definitions';

export default function definitionsReducer(state = {}, { type, payload }) {
  switch (type) {
    case SET_BULK_DEFINITIONS:
      return {
        ...state,
        ...payload
      };

    default:
      return state;
  }
}

export function setBulkDefinitions(payload) {
  return { type: SET_BULK_DEFINITIONS, payload };
}
