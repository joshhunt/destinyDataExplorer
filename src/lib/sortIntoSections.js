import { get, groupBy, sortBy, mapValues } from 'lodash';

import {
  HUNTER,
  TITAN,
  WARLOCK,
  WEAPON,
  ARMOR,
  GHOST,
  EMOTES,
  SHIP,
  SPARROW,
  EMBLEM,
  SHADER,
  HELMET,
  ARMS,
  CHEST,
  LEGS,
  CLASS_ITEM,
  ARMOR_MODS_ORNAMENTS,
  WEAPON_MODS_ORNAMENTS,
  ARMOR_MODS_ORNAMENTS_HUNTER,
  ARMOR_MODS_ORNAMENTS_TITAN,
  ARMOR_MODS_ORNAMENTS_WARLOCK,
  EXOTIC,
  LEGENDARY,
  UNCOMMON,
  RARE,
  COMMON
} from 'src/lib/destinyEnums';

const tierTypeNameValue = {
  Common: 4,
  Uncommon: 3,
  Rare: 2,
  Legendary: 1,
  Exotic: 0
};

export const isArmorOrnament = item =>
  item.itemCategoryHashes &&
  item.itemCategoryHashes.includes(ARMOR_MODS_ORNAMENTS);

const RARITY_SCORE = {
  [EXOTIC]: 100,
  [LEGENDARY]: 1000,
  [UNCOMMON]: 10000,
  [RARE]: 100000,
  [COMMON]: 1000000
};

function scoreItem(item) {
  const plugCategoryIdentifier = get(item, 'plug.plugCategoryIdentifier');
  if (isArmorOrnament(item) && plugCategoryIdentifier) {
    if (plugCategoryIdentifier.includes('head')) {
      return 1;
    } else if (plugCategoryIdentifier.includes('arms')) {
      return 2;
    } else if (plugCategoryIdentifier.includes('chest')) {
      return 3;
    } else if (plugCategoryIdentifier.includes('legs')) {
      return 4;
    } else if (plugCategoryIdentifier.includes('class')) {
      return 5;
    }
  }

  if (hasCategory(item, HELMET)) {
    return 1;
  } else if (hasCategory(item, ARMS)) {
    return 2;
  } else if (hasCategory(item, CHEST)) {
    return 3;
  } else if (hasCategory(item, LEGS)) {
    return 4;
  } else if (hasCategory(item, CLASS_ITEM)) {
    return 5;
  }
}

function sortArmor(items) {
  return sortBy(items, item => {
    const rarity =
      (item.inventory && RARITY_SCORE[item.inventory.tierTypeHash]) || 0;
    return rarity + scoreItem(item);
  });
}

const hasCategory = (item, category) =>
  item.itemCategoryHashes && item.itemCategoryHashes.includes(category);

function getItemCategory(entry, definitions) {
  const item = definitions[entry.type][entry.key];

  if (hasCategory(item, ARMOR_MODS_ORNAMENTS)) {
    if (hasCategory(item, ARMOR_MODS_ORNAMENTS_TITAN)) {
      return TITAN;
    } else if (hasCategory(item, ARMOR_MODS_ORNAMENTS_WARLOCK)) {
      return WARLOCK;
    } else if (hasCategory(item, ARMOR_MODS_ORNAMENTS_HUNTER)) {
      return HUNTER;
    }
  } else if (hasCategory(item, WEAPON)) {
    return 'weapon';
  } else if (hasCategory(item, GHOST)) {
    return 'ghosts';
  } else if (hasCategory(item, EMOTES)) {
    return 'emotes';
  } else if (hasCategory(item, SHIP)) {
    return 'ships';
  } else if (hasCategory(item, SPARROW)) {
    return 'sparrows';
  } else if (hasCategory(item, EMBLEM)) {
    return 'emblems';
  } else if (hasCategory(item, SHADER)) {
    return 'shaders';
  } else if (hasCategory(item, ARMOR)) {
    return item.classType;
  } else if (hasCategory(item, WEAPON_MODS_ORNAMENTS)) {
    return 'weaponOrnaments';
  } else {
    return 'other';
  }
}

export default function sortItems(_entries, definitions, justHashes = false) {
  const entries = Object.values(_entries); //uniqBy(_entries, entry => entry.dxId);

  const _sectionItems = groupBy(entries, entry =>
    getItemCategory(entry, definitions)
  );

  const sectionItems = mapValues(_sectionItems, items => {
    return sortBy(items, item => {
      return item.inventory
        ? tierTypeNameValue[item.inventory.tierTypeName]
        : 9999;
    });
  });

  const sections = [
    { name: 'Weapons', items: sectionItems.weapon },
    { name: 'Hunter armor', items: sortArmor(sectionItems[HUNTER]) },
    { name: 'Titan armor', items: sortArmor(sectionItems[TITAN]) },
    { name: 'Warlock armor', items: sortArmor(sectionItems[WARLOCK]) },
    { name: 'Emotes', items: sectionItems.emotes },
    { name: 'Ghosts', items: sectionItems.ghosts },
    { name: 'Ships', items: sectionItems.ships },
    { name: 'Sparrows', items: sectionItems.sparrows },
    { name: 'Emblems', items: sectionItems.emblems },
    { name: 'Shaders', items: sectionItems.shaders },
    { name: 'Weapon Ornaments', items: sectionItems.weaponOrnaments },
    { name: 'Other', items: sectionItems.other }
  ]
    .filter(({ items }) => {
      return items && items.length > 0;
    })
    .map(section => {
      return justHashes
        ? {
            ...section,
            items: section.items.map(entry => entry.key)
          }
        : section;
    });

  return sections;
}
