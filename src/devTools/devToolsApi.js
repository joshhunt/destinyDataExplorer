import css from "./cssLog";
import rot from "rot";

import { getShortTableName } from "lib/utils";
import { mergeBulkDefinitions } from "store/definitions";
import { DXCollection } from "./DXCollection";
import { sendExtraDefinitions } from "lib/workerSearch";
import lodash from "lodash";
import {
  startingSearchWorker,
  startingSearchWorkerSuccess,
} from "../store/app";

function makeGlobalConstantName(def) {
  const safeName =
    def.displayProperties?.name.replace(/[^A-Za-z]/g, "") ||
    `UnnamedCategory_${def.hash}`;

  return safeName;
}

const prevKeeper = new WeakMap();

const URL_BASE = "klzapuf-leayh-klmpupapvuz";

function transformIconsInDefinition(def, urlBase) {
  if (def?.displayProperties?.icon) {
    def.displayProperties.icon = urlBase + def.displayProperties.icon;
  }

  if (def?.displayProperties?.iconSequences) {
    for (const sequence of def.displayProperties.iconSequences) {
      if (sequence.frames) {
        sequence.frames = sequence.frames.map((v) => urlBase + v);
      }
    }
  }
}

async function getRemoteDefinitions(urlBase, fileName) {
  const url = `${urlBase}${fileName}.json`;

  const resp = await fetch(url);
  const data = await resp.json();

  return data;
}

export function connectToWindow(store) {
  window.__store = store;
  window._ = lodash;

  window.$loadRemoteDefinitions = async (pw, fileName) => {
    const urlBase = `https://${rot(
      URL_BASE,
      pw
    )}.s3.ap-southeast-2.amazonaws.com/`;

    let extraTables;

    if (pw && fileName) {
      extraTables = await getRemoteDefinitions(urlBase, fileName);
    } else if (typeof pw === "object") {
      extraTables = pw;
    }

    for (const tableName in extraTables) {
      const definitionsCollection = extraTables[tableName];

      for (const hash in definitionsCollection) {
        const def = definitionsCollection[hash];

        def.$$extra = true;

        transformIconsInDefinition(def, urlBase);

        if (def?.modifiers) {
          for (const modifier of def.modifiers) {
            transformIconsInDefinition(modifier, urlBase);
          }
        }
      }

      console.log(
        `Loaded ${Object.keys(definitionsCollection).length} ${tableName}`
      );
    }

    store.dispatch(mergeBulkDefinitions(extraTables));

    store.dispatch(startingSearchWorker());
    sendExtraDefinitions(extraTables).then(() => {
      store.dispatch(startingSearchWorkerSuccess());
    });
  };

  store.subscribe(
    catchErrors(() => {
      const newState = store.getState();
      const { definitions } = newState.definitions;
      window.__state = newState;
      window.__definitions = newState.definitions.definitions;

      if (!definitions || prevKeeper.has(definitions)) {
        return;
      }

      window.$mergeDefs = (newDefs) => {
        store.dispatch(mergeBulkDefinitions(newDefs));
      };

      for (const tableName in definitions) {
        const defs = definitions[tableName];
        const shortName = getShortTableName(tableName);
        const camelName =
          shortName.charAt(0).toUpperCase() + shortName.slice(1);

        const collection = new DXCollection(store, defs);
        window[`$${shortName}`] = collection;

        // Also connect functions compatible with @d2api/manifest
        window[`get${camelName}`] = (hash) => defs[hash];
        window[`getAll${camelName}`] = () => Object.values(defs);
      }

      // Set some consts for item categories
      if (definitions.DestinyItemCategoryDefinition) {
        for (const category of Object.values(
          definitions.DestinyItemCategoryDefinition
        )) {
          const safeName = makeGlobalConstantName(category);

          if (!window[safeName]) {
            window[safeName] = category.hash;
          }
        }
      }
    })
  );
}

function catchErrors(fn) {
  return (...args) => {
    try {
      fn(...args);
    } catch (err) {
      console.error("Caught error, but continued on");
      console.error(err);
    }
  };
}

const CODE_CSS =
  "background: black; padding: 2px; display: inline-block; font-family: monospace";

css.log(`
${css("", "font-family: sans-serif")}${css(
  "Welcome to the Destiny Data Explorer!",
  "font-weight: bold; background: #8e44ad; color: white; padding: 2px; font-size: 1.2em"
)}

There are a few handy utils installed here for more advanced querying. Each of the definitions are available on window:

    ${css("$InventoryItem", CODE_CSS)}

Additionally, all the item categories are available on via their name for your convience, like ${css(
  "Weapon",
  CODE_CSS
)} or ${css("ArmorModsLegs", CODE_CSS)}. You can preview them with ${css(
  `window.$categories()`,
  CODE_CSS
)}

Each table has a filter function, to easily filter each of the definitions:

    ${css(
      "$InventoryItem.filter(v => v.itemCategoryHashes.includes(FusionRifle))",
      CODE_CSS
    )}

You can call .show() on the results to display them in the Data Explorer UI:

    ${css(
      "$InventoryItem.filter(v => v.itemCategoryHashes.includes(FusionRifle)).show()",
      CODE_CSS
    )}

Lodash is available globally as ${css("_", CODE_CSS)}

Enjoy :)
`);
