import React from 'react';

import Icon from 'src/components/Icon';
import SearchHelp from 'src/components/SearchHelp';

import s from './styles.styl';
import logo from './logo.svg';

export default function SearchHeader({
  onSearchChange,
  searchValue,
  collectModeEnabled,
  toggleCollectMode,
  searchHelpEnabled,
  toggleSearchHelp
}) {
  return (
    <div className={s.root}>
      <div className={s.main}>
        <img className={s.logo} src={logo} alt="" />

        <span>Data Explorer</span>

        <input
          type="text"
          value={searchValue}
          placeholder="Search by item name or hash"
          className={s.searchField}
          onChange={onSearchChange}
        />

        <button
          className={searchHelpEnabled ? s.subtleButtonActive : s.subtleButton}
          onClick={toggleSearchHelp}
        >
          <div className={s.buttonInner}>
            <Icon name="question-circle" />
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

      {searchHelpEnabled && <SearchHelp />}
    </div>
  );
}
