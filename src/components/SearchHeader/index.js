import React from "react";

import s from "./styles.module.scss";

function SearchHeader() {
  return (
    <div className={s.root}>
      <div className={s.main}>
        <div className={s.logoish}>
          <span>Data Explorer</span>
        </div>

        <div className={s.mainMain}>
          <input
            type="text"
            className={s.searchField}
            placeholder="search here"
          />
        </div>

        <div className={s.languageButton}>
          <div className={s.buttonInner}>en</div>

          <select className={s.languageDropdown} value="en">
            <option value="en">english</option>
            <option value="fr">french</option>
          </select>
        </div>

        <button className={s.filterButton}>
          <div className={s.buttonInner}>Filters</div>
        </button>

        <button className={s.bigButton}>
          <div className={s.buttonInner}>+</div>
        </button>
      </div>
    </div>
  );
}

export default SearchHeader;
