import React from 'react';
import { connect } from 'react-redux';

import Modal from 'src/components/Modal';
import Icon from 'src/components/Icon';
import Filters from 'src/components/Filters';

import s from './styles.styl';
import logo from './logo.svg';

function SearchHeader({
  definitions,
  onSearchChange,
  collectModeEnabled,
  toggleCollectMode,
  filterDrawerVisible,
  toggleSearchHelp,
  setFilterValue,
  toggleFilterDrawer,
  filter,
  defs
}) {
  return (
    <div className={s.root}>
      <div className={s.main}>
        <img className={s.logo} src={logo} alt="" />

        <span>Data Explorer</span>

        <div className={s.mainMain}>
          <input
            type="text"
            value={filter.searchString || ''}
            placeholder="Search by item name or hash"
            className={s.searchField}
            onChange={onSearchChange}
          />

          {filter.itemCategoryHash && (
            <div className={s.appliedFilter}>
              Item Category:{' '}
              {
                defs.DestinyItemCategoryDefinition[filter.itemCategoryHash]
                  .displayProperties.name
              }
              <button
                className={s.closeButton}
                onClick={() => setFilterValue({ itemCategoryHash: null })}
              >
                <Icon className={s.closeIcon} name="times" />
              </button>
            </div>
          )}
        </div>

        <button className={s.filterButton} onClick={toggleFilterDrawer}>
          <div className={s.buttonInner}>
            <Icon className={s.filterIcon} name="sliders-v" />
            Filters
          </div>
        </button>

        <button
          className={collectModeEnabled ? s.bigButtonActive : s.bigButton}
          onClick={toggleCollectMode}
          title={
            collectModeEnabled ? 'Disable collect mode' : 'Enable collect mode'
          }
        >
          <div className={s.buttonInner}>
            <Icon name="plus" />
          </div>
        </button>
      </div>

      <Modal
        isOpen={filterDrawerVisible}
        onRequestClose={toggleFilterDrawer}
        closeTimeoutMS={200}
        className={{
          base: s.filterModalBase,
          afterOpen: s.filterModalAfterOpen,
          beforeClose: s.filterModalBeforeClose
        }}
        overlayClassName={{
          base: s.filterModalOverlayBase,
          afterOpen: s.filterModalOverlayAfterOpen,
          beforeClose: s.filterModalOverlayBeforeClose
        }}
      >
        <Filters
          className={s.filterDrawer}
          toggleFilterDrawer={toggleFilterDrawer}
        />
      </Modal>
    </div>
  );
}

const mapStateToProps = state => ({
  defs: state.definitions
});

export default connect(mapStateToProps)(SearchHeader);
