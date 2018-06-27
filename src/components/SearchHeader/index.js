import React from 'react';

import styles from './styles.styl';
import logo from './logo.svg';

export default function SearchHeader({ onSearchChange, searchValue }) {
  return (
    <div className={styles.root}>
      <img className={styles.logo} src={logo} alt="" />
      Data Explorer
      <input
        type="text"
        value={searchValue}
        placeholder="Search by item name or hash"
        className={styles.searchField}
        onChange={onSearchChange}
      />
    </div>
  );
}
