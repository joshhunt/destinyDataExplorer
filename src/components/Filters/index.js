import React from "react";
import { connect } from "react-redux";
import cx from "classnames";
import Select from "react-select";
import { intersection } from "lodash";

import Icon from "src/components/Icon";
import { setFilterValue } from "src/store/filter";

import s from "./styles.styl";

const FILTER_OPTION_RENDERERS = {
  select({ data, onChange, value }) {
    return (
      <Select
        value={value}
        className={s.dropdown}
        onChange={onChange}
        options={data}
        isClearable
      />
    );
  },
  multiSelect({ data, onChange, value }) {
    return (
      <Select
        isMulti
        value={value}
        className={s.dropdown}
        onChange={onChange}
        options={data}
        isClearable
      />
    );
  }
};

function selectDataFromDefs(defs) {
  return Object.values(defs || {}).map(d => ({
    value: d.hash,
    label: d.displayProperties.name || `Hash: ${d.hash}`
  }));
}

export const FILTERS = [
  {
    label: "Table name",
    id: "tableName",
    renderer: FILTER_OPTION_RENDERERS.select,
    searchFn: (obj, filterValue) => {
      return obj.type === filterValue.value;
    },
    data: definitions =>
      Object.keys(definitions).map(n => ({ value: n, label: n }))
  },

  {
    label: "Item category",
    id: "itemCategoryHash",
    renderer: FILTER_OPTION_RENDERERS.multiSelect,
    searchFn: (obj, filterValue) => {
      const filterValues = filterValue.map(f => f.value);
      const itemCategoryHashes = obj.def.itemCategoryHashes || [];

      return (
        intersection(itemCategoryHashes, filterValues).length ===
        filterValues.length
      );
    },
    data: definitions =>
      selectDataFromDefs(definitions.DestinyItemCategoryDefinition)
  },
  {
    label: "Item tier",
    id: "itemTier",
    renderer: FILTER_OPTION_RENDERERS.select,
    searchFn: (obj, filterValue) =>
      obj.def.inventory && obj.def.inventory.tierTypeHash === filterValue.value,
    data: definitions =>
      selectDataFromDefs(definitions.DestinyItemTierTypeDefinition)
  },

  {
    label: "Item class",
    id: "itemClass",
    renderer: FILTER_OPTION_RENDERERS.select,
    searchFn: (obj, filterValue) =>
      !obj.def.redacted && obj.def.classType === filterValue.value,
    data: () => [
      { value: 0, label: "Titan" },
      { value: 1, label: "Hunter" },
      { value: 2, label: "Warlock" }
    ]
  },

  {
    label: "Damage type",
    id: "damageType",
    renderer: FILTER_OPTION_RENDERERS.select,
    searchFn: (obj, filterValue) =>
      obj.def.damageTypeHashes &&
      obj.def.damageTypeHashes.includes(filterValue.value),
    data: definitions =>
      selectDataFromDefs(definitions.DestinyDamageTypeDefinition)
  }
];

function Filters({
  className,
  toggleFilterDrawer,
  definitions,
  setFilterValue,
  filters
}) {
  if (!definitions) {
    return null;
  }

  return (
    <div className={cx(className, s.root)}>
      <h2>Filters</h2>

      <button className={s.closeButton} onClick={toggleFilterDrawer}>
        <Icon className={s.closeIcon} name="times" />
      </button>

      {FILTERS.map(filter => {
        const Renderer = filter.renderer;
        const data = filter.data(definitions);

        return (
          <div className={s.filterSet}>
            <label className={s.filterLabel}>{filter.label}:</label>
            <Renderer
              data={data}
              value={filters[filter.id]}
              onChange={value => setFilterValue({ [filter.id]: value })}
            />
          </div>
        );
      })}
    </div>
  );
}

const mapStateToProps = state => ({
  definitions: state.definitions,
  filters: state.filter
});
const mapDispatchToActions = {
  setFilterValue
};

export default connect(
  mapStateToProps,
  mapDispatchToActions
)(Filters);
