import { get, isString, intersection, isNumber } from "lodash";
import * as enums from "../destinyEnums";
import { matches } from ".";
import { getLower } from "lib/utils";

const isItemCategoryHash = (obj, hash) =>
  obj.def &&
  obj.def.itemCategoryHashes &&
  obj.def.itemCategoryHashes.includes(hash);

const hasPerk = (obj, hash) => {
  const item = obj.def;

  if (!(item && item.sockets)) {
    return false;
  }

  const it = item.sockets.socketEntries.find(socket => {
    return socket.singleInitialItemHash === hash;
  });

  return !!it;
};

const hasRandomPerk = (obj, hash) => {
  const item = obj.def;

  if (!(item && item.sockets)) {
    return false;
  }

  const it = item.sockets.socketEntries.find(socket => {
    return socket.randomizedPlugItems.find(
      randomPlugItem => (randomPlugItem.plugItemHash = hash)
    );
  });

  return !!it;
};

const isDefinition = (obj, definitionName) => {
  return matches(obj.type, definitionName);
};

const classType = value => obj => obj.def.classType === value;

const $ = (term, secondArg, filterFn) => {
  const regex = isString(term)
    ? new RegExp(`^is:${term.toLowerCase()}$`, "i")
    : term;

  return filterFn
    ? {
        regex,
        parseInt: secondArg,
        filterFn
      }
    : { regex, filterFn: secondArg };
};

const itemCategory = hash => obj => isItemCategoryHash(obj, hash);

const allItemCategories = (...hashes) => obj => {
  return (
    obj.def &&
    obj.def.itemCategoryHashes &&
    intersection(obj.def.itemCategoryHashes, hashes).length === hashes.length
  );
};

const anyItemCategory = (...hashes) => obj => {
  return (
    obj.def &&
    obj.def.itemCategoryHashes &&
    intersection(obj.def.itemCategoryHashes, hashes).length
  );
};

const tierType = hash => obj =>
  obj.def && obj.def.inventory && obj.def.inventory.tierTypeHash === hash;

const sourceString = matching => obj =>
  obj.def &&
  obj.def.sourceString &&
  obj.def.sourceString.toLowerCase().includes(matching);

export default [
  $(/itemcategory:(\d+)/i, true, isItemCategoryHash),
  $(/hasperk:(\d+)/i, true, hasPerk),
  $(/hasrandomperk:(\d+)/i, true, hasRandomPerk),
  $(/data:(\w+)/i, false, isDefinition),
  $("hunter", classType(enums.HUNTER)),
  $("warlock", classType(enums.WARLOCK)),
  $("titan", classType(enums.TITAN)),

  $("legendary", tierType(enums.LEGENDARY)),
  $("exotic", tierType(enums.EXOTIC)),
  $("uncommon", tierType(enums.UNCOMMON)),
  $("rare", tierType(enums.RARE)),
  $("common", tierType(enums.COMMON)),

  $("kinetic", itemCategory(enums.KINETIC_WEAPON)),
  $("energy", itemCategory(enums.ENERGY_WEAPON)),
  $("power", itemCategory(enums.POWER_WEAPON)),

  $("weapon", itemCategory(enums.WEAPON)),
  $("armor", itemCategory(enums.ARMOR)),

  $("armorornament", itemCategory(enums.ARMOR_MODS_ORNAMENTS)),
  $("weaponornament", itemCategory(enums.WEAPON_MODS_ORNAMENTS)),
  $("dummy", itemCategory(enums.DUMMIES)),
  $("ghost", itemCategory(enums.GHOST)),
  $("sparrow", itemCategory(enums.SPARROW)),
  $("ship", itemCategory(enums.SHIP)),
  $("shader", itemCategory(enums.SHADER)),
  $("gear", anyItemCategory(enums.ARMOR, enums.WEAPON, enums.GHOST)),

  $("ghost", itemCategory(enums.GHOST)),
  $("sparrow", itemCategory(enums.SPARROW)),
  $("ship", itemCategory(enums.SHIP)),
  $("shader", itemCategory(enums.SHADER)),
  $("oldemote", itemCategory(enums.EMOTES)),
  $("emote", allItemCategories(enums.EMOTES, enums.MODS2)),

  $("emblem", itemCategory(enums.EMBLEM)),
  $("classitem", itemCategory(enums.CLASS_ITEMS)),

  $("medal", obj => obj.def && obj.def.medalTierIdentifier),

  $(
    "perk",
    obj => obj.def && obj.def.perks && obj.def.plug && obj.def.perks.length > 0
  ),

  $(/stackUniqueLabel:(.+)/i, false, (obj, term) =>
    getLower(obj, "def.inventory.stackUniqueLabel", "").includes(term)
  ),

  $(/=(.+):(.+)/, false, (obj, searchKey, searchValue) => {
    const searchValueAsNumber = parseInt(searchValue, 10);
    const valueFromKey = getLower(obj.def, searchKey);

    if (isNumber(searchValueAsNumber)) {
      return valueFromKey === searchValueAsNumber;
    }

    return valueFromKey === searchValue;
  }),

  $(
    /hasParent:(.+)/i,
    false,
    (obj, term) =>
      (obj.type === "DestinyRecordDefinition" ||
        obj.type === "DestinyCollectibleDefinition") &&
      get(
        obj,
        "def.presentationInfo.parentPresentationNodeHashes",
        []
      ).includes(parseInt(term, 10))
  ),

  $(/from:lastwish/, sourceString("last wish")),
  $(
    /temp:hastitle/,
    obj => obj.def && obj.def.titleInfo && obj.def.titleInfo.hasTitle
  ),

  $(/deep:(.+)/, false, (obj, term) => {
    const str = JSON.stringify(obj.def);
    return str.includes(term);
  }),

  $(/not:classified/, obj => obj.def && !obj.def.redacted),
  $("classified", obj => obj.def && obj.def.redacted)
];
