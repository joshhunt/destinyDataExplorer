import React from "react";
import { connect } from "react-redux";
import cx from "classnames";
import Select from "react-select";

import Icon from "src/components/Icon";
import { setFilterValue } from "src/store/filter";
import {
  FILTER_OPTION_RENDERERS as FILTER_OPTION_RENDERER_TYPES,
  FILTERS
} from "src/lib/search/guiSearchFilters";

import s from "./styles.styl";

const FILTER_OPTION_RENDERERS = {
  [FILTER_OPTION_RENDERER_TYPES.SELECT]: ({ data, onChange, value }) => {
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
  [FILTER_OPTION_RENDERER_TYPES.MULTI_SELECT]: ({ data, onChange, value }) => {
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

      {FILTERS.map((filter, index) => {
        const Renderer = FILTER_OPTION_RENDERERS[filter.renderer];
        const data = filter.data(definitions);

        return (
          <div className={s.filterSet} key={index}>
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
  definitions: state.definitions.definitions,
  filters: state.filter
});
const mapDispatchToActions = {
  setFilterValue
};

export default connect(
  mapStateToProps,
  mapDispatchToActions
)(Filters);
