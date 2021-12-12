import { pickBy, mapValues } from "lodash";
import { makePayloadAction } from "./utils";
import assignDeep from "assign-deep";

export const SET_BULK_DEFINITIONS = "Set bulk definitions";
export const MERGE_BULK_DEFINITIONS = "Merge bulk definitions";
export const DEFINITIONS_ERROR = "Definitions error";
export const DEFINITIONS_STATUS = "Definitions status";

const initialState = {
  definitions: {},
};

export default function definitionsReducer(
  state = initialState,
  { type, payload }
) {
  switch (type) {
    case DEFINITIONS_ERROR: {
      return {
        ...state,
        error: true,
      };
    }

    case DEFINITIONS_STATUS: {
      return {
        ...state,
        status: payload.status,
      };
    }

    case SET_BULK_DEFINITIONS: {
      const filtered = pickBy(payload, (defs) => defs);
      const withIds = mapValues(filtered, (arrOfDefs, defType) =>
        mapValues(arrOfDefs, (v) => ({ ...v, $type: defType }))
      );

      return {
        ...state,
        definitions: withIds,
        error: false,
      };
    }

    case MERGE_BULK_DEFINITIONS: {
      const newDefs = assignDeep({}, state.definitions, payload);

      return {
        ...state,
        definitions: newDefs,
        error: false,
      };
    }

    default:
      return state;
  }
}

export const setBulkDefinitions = makePayloadAction(SET_BULK_DEFINITIONS);
export const definitionsStatus = makePayloadAction(DEFINITIONS_STATUS);
export const definitionsError = makePayloadAction(DEFINITIONS_ERROR);
export const mergeBulkDefinitions = makePayloadAction(MERGE_BULK_DEFINITIONS);
