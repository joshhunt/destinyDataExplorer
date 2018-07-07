import { makeSimpleAction, makePayloadAction, toggle } from './utils';

const INITIAL_STATE = {
  collectModeEnabled: false,
  searchHelpEnabled: false,
  collectedItems: {}
};

const TOGGLE_COLLECT_MODE = 'Toggle collect mode';
const TOGGLE_SEARCH_HELP = 'Toggle searchHelp';
const ADD_COLLECTED_ITEM = 'Add collected item';
const REMOVE_COLLECTED_ITEM = 'Remove collected item';

export default function appReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case TOGGLE_COLLECT_MODE:
      return toggle(state, 'collectModeEnabled');

    case TOGGLE_SEARCH_HELP:
      return toggle(state, 'searchHelpEnabled');

    case ADD_COLLECTED_ITEM:
      return {
        ...state,
        collectedItems: {
          ...state.collectedItems,
          [action.payload.dxId]: action.payload
        }
      };

    case REMOVE_COLLECTED_ITEM:
      const newCollectedItems = { ...state.collectedItems };
      delete newCollectedItems[action.payload.dxId];
      return {
        ...state,
        collectedItems: newCollectedItems
      };

    default:
      return state;
  }
}

export const toggleCollectMode = makeSimpleAction(TOGGLE_COLLECT_MODE);
export const toggleSearchHelp = makeSimpleAction(TOGGLE_SEARCH_HELP);

export const addCollectedItem = makePayloadAction(ADD_COLLECTED_ITEM);
export const removeCollectedItem = makePayloadAction(REMOVE_COLLECTED_ITEM);
