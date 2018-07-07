import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import Item from 'src/components/Item';

import s from './styles.styl';

function CategoryListing({ item, definitions, pathForItem, categories }) {
  return (
    <div>
      {categories.map(category => {
        return (
          <div className={s.section}>
            <div className={s.sectionTitle}>{category.categoryId}</div>
            <div className={s.sectionItemList}>
              {category.vendorItemIndexes.map(itemIndex => {
                const vendorItemEntry = item.itemList[itemIndex];
                const vendorItem =
                  definitions.DestinyInventoryItemDefinition[
                    vendorItemEntry.itemHash
                  ];
                return (
                  <Item
                    pathForItem={pathForItem}
                    className={s.item}
                    entry={{
                      type: 'DestinyInventoryItemDefinition',
                      def: vendorItem
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Vendor({ item, definitions, pathForItem }) {
  return (
    <div className={s.root}>
      <Tabs>
        <TabList>
          <Tab>Empty</Tab>
          <Tab>Categories</Tab>
          <Tab>Original Categories</Tab>
          <Tab>Display Categories</Tab>
        </TabList>

        <TabPanel />
        <TabPanel>
          <CategoryListing
            categories={item.categories}
            pathForItem={pathForItem}
            item={item}
            definitions={definitions}
          />
        </TabPanel>

        <TabPanel>
          <CategoryListing
            categories={item.originalCategories}
            pathForItem={pathForItem}
            item={item}
            definitions={definitions}
          />
        </TabPanel>

        <TabPanel>
          {item.displayCategories.map(displayCategory => {
            return (
              <div className={s.section}>
                <div className={s.sectionTitle}>
                  {displayCategory.displayProperties.name}
                </div>
              </div>
            );
          })}
        </TabPanel>
      </Tabs>
    </div>
  );
}
