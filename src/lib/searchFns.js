import { isString, intersection } from 'lodash';
import * as enums from './destinyEnums';

const isItemCategoryHash = (obj, hash) =>
  obj.def &&
  obj.def.itemCategoryHashes &&
  obj.def.itemCategoryHashes.includes(hash);

const classType = value => obj => obj.def.classType === value;

const $ = (term, secondArg, filterFn) => {
  const regex = isString(term)
    ? new RegExp(`^is:${term.toLowerCase()}$`, 'i')
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

const isWeapon = itemCategory(enums.WEAPON);
const isArmor = itemCategory(enums.ARMOR);
const isLegendary = tierType(enums.LEGENDARY);
const isExotic = tierType(enums.EXOTIC);
const isArmorOrnament = itemCategory(enums.ARMOR_MODS_ORNAMENTS);
const isWeaponOrnament = itemCategory(enums.WEAPON_MODS_ORNAMENTS);

export default [
  $(/itemcategory:(\d+)/i, true, isItemCategoryHash),
  $('hunter', classType(enums.HUNTER)),
  $('warlock', classType(enums.WARLOCK)),
  $('titan', classType(enums.TITAN)),
  $('weapon', isWeapon),
  $('armor', isArmor),
  $('legendary', isLegendary),
  $('exotic', isExotic),
  $('armorornament', isArmorOrnament),
  $('weaponornament', isWeaponOrnament),
  $('kinetic', itemCategory(enums.KINETIC_WEAPON)),
  $('energy', itemCategory(enums.ENERGY_WEAPON)),
  $('power', itemCategory(enums.POWER_WEAPON)),
  $('dummy', itemCategory(enums.DUMMIES)),
  $('ghost', itemCategory(enums.GHOST)),
  $('sparrow', itemCategory(enums.SPARROW)),
  $('ship', itemCategory(enums.SHIP)),
  $('shader', itemCategory(enums.SHADER)),
  $('gear', anyItemCategory(enums.ARMOR, enums.WEAPON, enums.GHOST)),

  $('ghost', itemCategory(enums.GHOST)),
  $('sparrow', itemCategory(enums.SPARROW)),
  $('ship', itemCategory(enums.SHIP)),
  $('shader', itemCategory(enums.SHADER)),
  $('oldemote', itemCategory(enums.EMOTES)),
  $('emote', allItemCategories(enums.EMOTES, enums.MODS2)),

  $(/not:classified/, obj => obj.def && !obj.def.redacted),
  $('classified', obj => obj.def && obj.def.redacted)
];
