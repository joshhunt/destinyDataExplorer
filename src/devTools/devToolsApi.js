import css from "./cssLog";

import { getShortTableName } from "lib/utils";
import { DXCollection } from "./DXCollection";

function makeGlobalConstantName(def) {
  const safeName =
    def.displayProperties?.name.replace(/[^A-Za-z]/g, "") ||
    `UnnamedCategory_${def.hash}`;

  return safeName;
}

const prevKeeper = new WeakMap();

export function connectToWindow(store) {
  window.__store = store;

  store.subscribe(
    catchErrors(() => {
      const newState = store.getState();
      const { definitions } = newState.definitions;
      window.__state = newState;
      window.__definitions = newState.definitions.definitions;

      if (!definitions || prevKeeper.has(definitions)) {
        return;
      }

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

Enjoy :)
`);
