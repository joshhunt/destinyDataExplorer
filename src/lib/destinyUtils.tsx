import React from "react";
import { memoize } from "lodash";

import { EMBLEM, HUNTER, TITAN, WARLOCK, NO_CLASS } from "lib/destinyEnums";
import { getLower } from "lib/utils";
import { AllDestinyManifestComponents } from "bungie-api-ts/destiny2/manifest";
import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2/interfaces";

// TODO: we can just use itemCategoryHashes for this now?
export const isOrnament = (item: DestinyInventoryItemDefinition) =>
  item.inventory &&
  item.inventory.stackUniqueLabel &&
  item.plug &&
  item.plug.plugCategoryIdentifier &&
  item.plug.plugCategoryIdentifier.includes("skins");

export const makeTypeShort = memoize((type) => {
  const match = type.match(/Destiny(\w+)Definition/);
  return match ? match[1] : type;
});

export const getName = (item: any): React.ReactNode => {
  return (
    (item.displayProperties && item.displayProperties.name) ||
    item.statName || <em>No name</em>
  );
};

export const bungieUrl = (path: string | undefined) => {
  return path && path.includes && path.includes("//bungie.net/")
    ? path
    : `https://bungie.net${path}`;
};

function classFromString(str: string) {
  const results = str.match(/hunter|titan|warlock/);
  if (!results) {
    return NO_CLASS;
  }

  switch (results[0]) {
    case "hunter":
      return HUNTER;
    case "warlock":
      return WARLOCK;
    case "titan":
      return TITAN;
    default:
      return NO_CLASS;
  }
}

export const getItemClass = (item: DestinyInventoryItemDefinition) => {
  const stackUniqueLabel = getLower(item, "inventory.stackUniqueLabel");
  const plugCategoryIdentifier = getLower(item, "plug.plugCategoryIdentifier");

  if (item.itemCategoryHashes?.includes(EMBLEM) && stackUniqueLabel.length) {
    return classFromString(stackUniqueLabel);
  }

  // TODO: Ornaments might provide this better now
  if (item.classType === 3 && isOrnament(item)) {
    return classFromString(plugCategoryIdentifier);
  }

  return item.classType;
};

interface AllDefinitionsEntry {
  dxId: string;
  type: string;
  key: string;
  def: any;
}

export const makeAllDefsArray = memoize(
  (allDefs: AllDestinyManifestComponents) => {
    let results: AllDefinitionsEntry[] = [];

    for (const [type, defs] of Object.entries(allDefs)) {
      for (const [key, def] of Object.entries(defs)) {
        results.push({
          dxId: `${type}:${key}`, // Data Explorer-specific ID, (hopefully) globally unique across all entries
          type, // definition type
          key, // definition key, like hash
          def, // the definition item itself
        });
      }
    }

    return results;
  }
);

const MAX_RANDOM_ITEMS = 100;
export const getRandomItems = memoize((allDefs) => {
  let n = MAX_RANDOM_ITEMS;
  const arr = makeAllDefsArray(allDefs).filter((obj) => {
    return (
      obj.def && obj.def.displayProperties && obj.def.displayProperties.hasIcon
    );
  });

  var result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len) return [];
  while (n--) {
    var x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
});
