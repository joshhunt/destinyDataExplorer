import { makeSimpleAction, makePayloadAction, toggle } from "./utils";
import { getDestiny } from "src/lib/destiny";

const INITIAL_STATE = {
  collectModeEnabled: false,
  filterDrawerVisible: false,
  searchIsReady: false,
  collectedItems: {}
};

const TOGGLE_COLLECT_MODE = "Toggle collect mode";
const TOGGLE_FILTER_DRAWER = "Toggle filter drawer";
const ADD_COLLECTED_ITEM = "Add collected item";
const REMOVE_COLLECTED_ITEM = "Remove collected item";

const SET_BUNGIE_SETTINGS = "Set Bungie.net settings";
const SET_ACTIVE_LANGUAGE = "Set active language";

const STARTING_SEARCH_WORKER = "Starting search worker";
const STARTING_SEARCH_WORKER_SUCCESS = "Starting search worker - SUCCESS";

export default function appReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_BUNGIE_SETTINGS:
      return {
        ...state,
        bungieSettings: action.payload
      };

    case SET_ACTIVE_LANGUAGE:
      return {
        ...state,
        activeLanguage: action.payload
      };

    case TOGGLE_COLLECT_MODE:
      return toggle(state, "collectModeEnabled");

    case TOGGLE_FILTER_DRAWER:
      return toggle(state, "filterDrawerVisible");

    case STARTING_SEARCH_WORKER:
      return {
        ...state,
        searchIsReady: false
      };

    case STARTING_SEARCH_WORKER_SUCCESS:
      return {
        ...state,
        searchIsReady: true
      };

    case ADD_COLLECTED_ITEM:
      return {
        ...state,
        collectModeEnabled: true,
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
export const toggleFilterDrawer = makeSimpleAction(TOGGLE_FILTER_DRAWER);

export const startingSearchWorker = makeSimpleAction(STARTING_SEARCH_WORKER);
export const startingSearchWorkerSuccess = makeSimpleAction(
  STARTING_SEARCH_WORKER_SUCCESS
);

export const addCollectedItem = makePayloadAction(ADD_COLLECTED_ITEM);
export const removeCollectedItem = makePayloadAction(REMOVE_COLLECTED_ITEM);

export const setActiveLanguage = makePayloadAction(SET_ACTIVE_LANGUAGE);

export const fetchBungieSettings = () => dispatch => {
  getDestiny("/Platform/Settings/").then(settings => {
    console.log("settings:", settings);
    dispatch({
      type: SET_BUNGIE_SETTINGS,
      payload: settings
    });
  });
};
