import React, { Fragment } from 'react';

import s from './styles.styl';

const list = (...arr) => (
  <Fragment>
    {arr.map((x, i) => (
      <span key={i}>
        {x}
        <br />
      </span>
    ))}
  </Fragment>
);

const HELP_TEXT = [
  {
    filter: 'Hash',
    description: 'Searches entries whos hash/key matches the text'
  },
  {
    filter: 'Entry name',
    description:
      'Partial-match search on entry names e.g. "Tesseract" for "Tesseract Trace IV" items'
  },
  {
    filter: 'Data type',
    description:
      'Partial-match search on data types / tables from mobileWorldContent e.g. "Item" for all items from the DestinyInventoryItemDefintions table'
  },
  {
    filter: 'hasPerk:[perkItemHash]',
    description:
      'Searches items that has the specified perk. Note: the hash must be the InventoryItem representation of the perk, not the SandboxPerk. e.g. hasPerk:216781713'
  },
  {
    filter: list('is:hunter', 'is:titan', 'is:warlock'),
    description: 'Searches items based on class'
  },
  {
    filter: list(
      'is:legendary',
      'is:exotic',
      'is:uncommon',
      'is:rare',
      'is:common'
    ),
    description: 'Searches by item rarity'
  },
  {
    filter: list('is:kinetic', 'is:energy', 'is:power'),
    description: 'Searches weapons by damage type'
  },
  {
    filter: list(
      'is:weapon',
      'is:armor',
      'is:armorornament',
      'is:weaponornament',
      'is:dummy',
      'is:ghost',
      'is:sparrow',
      'is:ship',
      'is:shader',
      'is:gear',
      'is:ghost',
      'is:sparrow',
      'is:ship',
      'is:shader',
      'is:emote',
      'is:emblem',
      'is:classitem'
    ),
    description: 'Searches by basic item type'
  }
];

export default function SearchHelp({ definitions, setSearchValue }) {
  console.log('definitions:', definitions);
  return (
    <div className={s.root}>
      <div className={s.one}>
        <h2 className={s.title}>Supported tables</h2>
        <table className={s.table}>
          <thead className={s.tableHeader}>
            <tr>
              <td className={s.filterCell}>Table name</td>
              <td className={s.descriptionCell}>Items</td>
            </tr>
          </thead>

          <tbody>
            {Object.keys(definitions).map((tableName, index) => (
              <tr key={index} className={s.row}>
                <td
                  className={s.tableNameCell}
                  onClick={() => setSearchValue(tableName)}
                >
                  {tableName}
                </td>
                <td className={s.descriptionCell}>
                  {Object.keys(definitions[tableName]).length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={s.two}>
        <h2 className={s.title}>Filters</h2>
        <table className={s.table}>
          <thead className={s.tableHeader}>
            <tr>
              <td className={s.filterCell}>Filter</td>
              <td className={s.descriptionCell}>Description</td>
            </tr>
          </thead>

          <tbody>
            {HELP_TEXT.map(({ filter, description }, index) => (
              <tr key={index} className={s.row}>
                <td className={s.filterCell}>{filter}</td>
                <td className={s.descriptionCell}>{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
