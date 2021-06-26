import { get, intersection } from "lodash";
import * as enums from "../destinyEnums";
import { getLower } from "lib/utils";
import _normalizeText from "normalize-text";

type Hash = number | string;

const isItemCategoryHash = (obj: any, hash: Hash) =>
  obj.def &&
  obj.def.itemCategoryHashes &&
  obj.def.itemCategoryHashes.includes(hash);

const hasPerk = (obj: any, hash: Hash) => {
  const item = obj.def;

  if (!(item && item.sockets)) {
    return false;
  }

  const it = item.sockets.socketEntries.find((socket: any) => {
    return socket.singleInitialItemHash === hash;
  });

  return !!it;
};

const hasRandomPerk = (obj: any, hash: Hash) => {
  const item = obj.def;

  if (!(item && item.sockets)) {
    return false;
  }

  const it = item.sockets.socketEntries.find((socket: any) => {
    return socket.randomizedPlugItems.find(
      (randomPlugItem: any) => (randomPlugItem.plugItemHash = hash)
    );
  });

  return !!it;
};

const isDefinition = (obj: any, definitionName: Hash) => {
  return matches(obj.type, definitionName as string);
};

const classType = (value: number) => (obj: any) => obj.def.classType === value;

const itemCategory = (hash: number) => (obj: any) =>
  isItemCategoryHash(obj, hash);

const allItemCategories =
  (...hashes: number[]) =>
  (obj: any) => {
    return (
      obj.def &&
      obj.def.itemCategoryHashes &&
      intersection(obj.def.itemCategoryHashes, hashes).length === hashes.length
    );
  };

const anyItemCategory =
  (...hashes: number[]) =>
  (obj: any) => {
    return (
      obj.def &&
      obj.def.itemCategoryHashes &&
      intersection(obj.def.itemCategoryHashes, hashes).length
    );
  };

const tierType = (hash: number) => (obj: any) =>
  obj.def && obj.def.inventory && obj.def.inventory.tierTypeHash === hash;

type FilterFn = (obj: any, filterFnArgument: string | number) => boolean;

function makeSearchFn(
  fnName: string,
  parseValueAsNumber: boolean,
  filterFn: FilterFn
) {
  return {
    fnName,
    parseValueAsNumber,
    filterFn,
  };
}

function isFn(fnArgument: string, filterFn: FilterFn) {
  return {
    fnName: fnArgument,
    filterFn,
  };
}

function makeIsFnPredicate(
  subfunctions: Array<{ fnName: string; filterFn: FilterFn }>
) {
  return (obj: any, subFnName: string | number) => {
    const matchingFn = subfunctions.find((v) => v.fnName === subFnName);

    return matchingFn ? matchingFn.filterFn(obj, subFnName) : false;
  };
}

const normalizeTextCache = new Map();
const normalizeText = (string: string) => {
  const cached = normalizeTextCache.get(string);

  if (cached) {
    return cached;
  }

  const result = _normalizeText(string.toLocaleLowerCase());
  normalizeTextCache.set(string, result);

  return result;
};

export const matches = (
  string: string | undefined,
  searchTerm: string | undefined
) => {
  if (!string || !searchTerm) {
    return false;
  }

  const normalizedString = normalizeText(string);
  const normalizedSearchTerm = normalizeText(searchTerm);

  return normalizedString.includes(normalizedSearchTerm);
};

export function phraseFn(obj: any, phrase: string) {
  const displayName =
    obj.def && obj.def.displayProperties && obj.def.displayProperties.name;

  return (
    obj.key === phrase ||
    matches(obj.type, phrase) ||
    matches(displayName, phrase) ||
    matches(obj.def.statId, phrase) ||
    matches(obj.def.statName, phrase) ||
    matches(obj.def.progressDescription, phrase) ||
    matches(obj.def.setData?.questLineName, phrase)
  );
}

const SEARCH_FNS = [
  makeSearchFn("itemcategory", true, isItemCategoryHash),
  makeSearchFn("hasperk", true, hasPerk),
  makeSearchFn("hasrandomperk", true, hasRandomPerk),
  makeSearchFn("data", false, isDefinition),

  makeSearchFn(
    "is",
    false,
    makeIsFnPredicate([
      isFn("hunter", classType(enums.HUNTER)),
      isFn("warlock", classType(enums.WARLOCK)),
      isFn("titan", classType(enums.TITAN)),

      isFn("legendary", tierType(enums.LEGENDARY)),
      isFn("exotic", tierType(enums.EXOTIC)),
      isFn("uncommon", tierType(enums.UNCOMMON)),
      isFn("rare", tierType(enums.RARE)),
      isFn("common", tierType(enums.COMMON)),

      isFn("kinetic", itemCategory(enums.KINETIC_WEAPON)),
      isFn("energy", itemCategory(enums.ENERGY_WEAPON)),
      isFn("power", itemCategory(enums.POWER_WEAPON)),

      isFn("weapon", itemCategory(enums.WEAPON)),
      isFn("armor", itemCategory(enums.ARMOR)),

      isFn("armorornament", itemCategory(enums.ARMOR_MODS_ORNAMENTS)),
      isFn("weaponornament", itemCategory(enums.WEAPON_MODS_ORNAMENTS)),
      isFn("dummy", itemCategory(enums.DUMMIES)),
      isFn("ghost", itemCategory(enums.GHOST)),
      isFn("sparrow", itemCategory(enums.SPARROW)),
      isFn("ship", itemCategory(enums.SHIP)),
      isFn("shader", itemCategory(enums.SHADER)),
      isFn("gear", anyItemCategory(enums.ARMOR, enums.WEAPON, enums.GHOST)),

      isFn("ghost", itemCategory(enums.GHOST)),
      isFn("sparrow", itemCategory(enums.SPARROW)),
      isFn("ship", itemCategory(enums.SHIP)),
      isFn("shader", itemCategory(enums.SHADER)),
      isFn("oldemote", itemCategory(enums.EMOTES)),
      isFn("emote", allItemCategories(enums.EMOTES, enums.MODS2)),

      isFn("emblem", itemCategory(enums.EMBLEM)),
      isFn("classitem", itemCategory(enums.CLASS_ITEMS)),

      isFn("medal", (obj) => obj.def && obj.def.medalTierIdentifier),

      isFn(
        "perk",
        (obj) =>
          obj.def && obj.def.perks && obj.def.plug && obj.def.perks.length > 0
      ),
    ])
  ),

  makeSearchFn("stackUniqueLabel", false, (obj, term) =>
    getLower(obj, "def.inventory.stackUniqueLabel", "").includes(term)
  ),

  makeSearchFn(
    "hasParent",
    false,
    (obj, term) =>
      (obj.type === "DestinyRecordDefinition" ||
        obj.type === "DestinyCollectibleDefinition") &&
      get(
        obj,
        "def.presentationInfo.parentPresentationNodeHashes",
        []
      ).includes(parseInt(term as string, 10))
  ),

  makeSearchFn("deep", false, (obj, term) => {
    const stringTerm = typeof term === "string" ? term : term.toString();
    const str = JSON.stringify(obj.def).toLowerCase();
    return str.includes(stringTerm);
  }),
];

export default SEARCH_FNS;
