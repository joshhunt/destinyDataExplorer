import { intersection } from "lodash";

function selectDataFromDefs(defs) {
  return Object.values(defs || {}).map((d) => ({
    value: d.hash,
    label: d.displayProperties.name || `Hash: ${d.hash}`,
  }));
}

export const FILTER_OPTION_RENDERERS = {
  SELECT: "SELECT",
  MULTI_SELECT: "MULTI_SELECT",
};

export const FILTERS = [
  {
    label: "Table name",
    id: "tableName",
    renderer: FILTER_OPTION_RENDERERS.SELECT,
    searchFn: (obj, filterValue) => {
      return obj.type === filterValue.value;
    },
    data: (definitions) =>
      Object.keys(definitions).map((n) => ({ value: n, label: n })),
  },

  {
    label: "Item category",
    id: "itemCategoryHash",
    renderer: FILTER_OPTION_RENDERERS.MULTI_SELECT,
    searchFn: (obj, filterValue) => {
      const filterValues = filterValue.map((f) => f.value);
      const itemCategoryHashes = obj.def.itemCategoryHashes || [];

      return (
        intersection(itemCategoryHashes, filterValues).length ===
        filterValues.length
      );
    },
    data: (definitions) =>
      selectDataFromDefs(definitions.DestinyItemCategoryDefinition),
  },
  {
    label: "Item tier",
    id: "itemTier",
    renderer: FILTER_OPTION_RENDERERS.SELECT,
    searchFn: (obj, filterValue) =>
      obj.def.inventory && obj.def.inventory.tierTypeHash === filterValue.value,
    data: (definitions) =>
      selectDataFromDefs(definitions.DestinyItemTierTypeDefinition),
  },

  {
    label: "Item class",
    id: "itemClass",
    renderer: FILTER_OPTION_RENDERERS.SELECT,
    searchFn: (obj, filterValue) =>
      !obj.def.redacted && obj.def.classType === filterValue.value,
    data: () => [
      { value: 0, label: "Titan" },
      { value: 1, label: "Hunter" },
      { value: 2, label: "Warlock" },
    ],
  },

  {
    label: "Damage type",
    id: "damageType",
    renderer: FILTER_OPTION_RENDERERS.SELECT,
    searchFn: (obj, filterValue) =>
      obj.def.damageTypeHashes &&
      obj.def.damageTypeHashes.includes(filterValue.value),
    data: (definitions) =>
      selectDataFromDefs(definitions.DestinyDamageTypeDefinition),
  },
];
