import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';

import Icon from 'src/components/Icon';
import { setFilterValue } from 'src/store/filter';

import s from './styles.styl';

const DROPDOWN = 'dropdown';

export const FILTERS = {
  [DROPDOWN]: {
    searchFn: (obj, filterValue) => {},
    renderer: ({ data, onChange }) => (
      <select className={s.dropdown} onChange={onChange}>
        {data &&
          data.map(cat => (
            <option value={cat.hash}>{cat.displayProperties.name}</option>
          ))}
      </select>
    )
  }
};

const FILTER_OPTION_RENDERERS = {
  [DROPDOWN]: ({ data, onChange }) => (
    <select className={s.dropdown} onChange={onChange}>
      {data &&
        data.map(cat => (
          <option value={cat.hash}>{cat.displayProperties.name}</option>
        ))}
    </select>
  )
};

function Filters({
  className,
  toggleFilterDrawer,
  definitions,
  setFilterValue
}) {
  const filterOptions = [
    {
      label: 'Item category',
      id: 'itemCategoryHash',
      type: DROPDOWN,
      data: Object.values(definitions.DestinyItemCategoryDefinition || {})
    }
  ];

  return (
    <div className={cx(className, s.root)}>
      <h2>Filters</h2>

      <button className={s.closeButton} onClick={toggleFilterDrawer}>
        <Icon className={s.closeIcon} name="times" />
      </button>

      {filterOptions.map(filter => {
        const Renderer = FILTER_OPTION_RENDERERS[filter.type];

        return (
          <div>
            <label>{filter.label}:</label>
            <br />
            <Renderer
              data={filter.data}
              onChange={ev => setFilterValue({ [filter.id]: ev.target.value })}
            />
          </div>
        );
      })}
    </div>
  );
}

const mapStateToProps = state => ({ definitions: state.definitions });
const mapDispatchToActions = {
  setFilterValue
};

export default connect(mapStateToProps, mapDispatchToActions)(Filters);
