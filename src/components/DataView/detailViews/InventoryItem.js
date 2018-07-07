import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { groupBy } from 'lodash';
import 'react-tabs/style/react-tabs.css';

import Item from 'src/components/Item';

import s from './styles.styl';

export default function InventoryItem({ item, definitions, pathForItem }) {
  if (!item.gearset || item.gearset.itemList.length === 0) {
    return null;
  }

  return (
    <div className={s.root}>
      <div className={s.section}>
        <div className={s.sectionTitle}>gearset itemList</div>

        <div className={s.sectionItemList}>
          {item.gearset.itemList.map(itemIndex => {
            const gearSetItem =
              definitions.DestinyInventoryItemDefinition[itemIndex];

            return (
              <Item
                pathForItem={pathForItem}
                className={s.item}
                entry={{
                  type: 'DestinyInventoryItemDefinition',
                  def: gearSetItem
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
