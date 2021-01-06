import {
  DestinyDisplayCategoryDefinition,
  DestinyVendorDefinition,
  DestinyVendorItemDefinition,
} from "bungie-api-ts/destiny2";
import React, { useMemo, useState } from "react";
import VendorSaleItem from "./VendorSaleItem";
import s from "../styles.module.scss";
import TabButtonList, { TabKind } from "components/TabButtonList";
import { notEmpty } from "lib/utils";
import { SelectBreak } from "components/DataView/JsonValueAnnotation";

interface VendorDetailsProps {
  definition: DestinyVendorDefinition;
}

interface Category {
  displayCategory?: DestinyDisplayCategoryDefinition;
  manualName?: string;
  items: DestinyVendorItemDefinition[];
}

interface NormalizedCategory {
  title: string | undefined;
  items: DestinyVendorItemDefinition[];
  tags: string[];
}

const VendorDetails: React.FC<VendorDetailsProps> = ({ definition }) => {
  const [activeTab, setActiveTab] = useState(TabKind.VendorCategories);

  const displayCategoriesData = useMemo(() => {
    const categories: Category[] = definition.displayCategories.map(
      (displayCategory) => ({
        displayCategory,
        items: [],
      })
    );

    const negativeOneCategory: Category = {
      manualName: "-1 uncategorised items",
      items: [],
    };

    const fallbackCategory: Category = {
      manualName: "Missing category",
      items: [],
    };

    for (const vendorItem of definition.itemList) {
      const category = categories[vendorItem.displayCategoryIndex];

      if (category) {
        category.items.push(vendorItem);
      } else if (vendorItem.displayCategoryIndex === -1) {
        negativeOneCategory.items.push(vendorItem);
      } else {
        fallbackCategory.items.push(vendorItem);
      }
    }

    categories.push(negativeOneCategory);
    categories.push(fallbackCategory);

    return categories;
  }, [definition]);

  const displayCategories: NormalizedCategory[] = displayCategoriesData.map(
    (category) => ({
      title: category.displayCategory
        ? category.displayCategory.displayProperties.name
        : category.manualName,
      items: category.items,
      tags: [
        category.displayCategory?.index !== undefined
          ? `index: ${category.displayCategory?.index}`
          : null,
        category.displayCategory?.identifier &&
          `identifier: ${category.displayCategory?.identifier}`,
      ].filter(notEmpty),
    })
  );

  const categories: NormalizedCategory[] = definition.categories.map(
    (category) => ({
      title: category.displayTitle,
      items: category.vendorItemIndexes.map((v) => definition.itemList[v]),
      tags: [`categoryIndex: ${category.categoryIndex}`],
    })
  );

  const categoriesToDisplay =
    activeTab === TabKind.VendorCategories ? categories : displayCategories;

  return (
    <div>
      <TabButtonList
        onTabChange={(tabId) => setActiveTab(tabId)}
        activeTab={activeTab}
        options={[
          [TabKind.VendorCategories, "Categories"] as const,
          [TabKind.VendorDisplayCategories, "Display categories"] as const,
        ]}
      />

      {categoriesToDisplay.map(
        (category, index) =>
          category.items.length > 0 && (
            <div className={s.category} key={index}>
              <h4 className={s.categoryTitle}>
                {category.title || <em>No name</em>}

                {category.tags.map((tag, ii) => (
                  <>
                    <span className={s.tag} key={ii}>
                      {tag}
                    </span>
                    <SelectBreak />
                  </>
                ))}
              </h4>

              <div className={s.categoryItems}>
                {category.items.map((itemSale) => {
                  return (
                    <VendorSaleItem
                      vendorItem={itemSale}
                      key={itemSale.vendorItemIndex}
                    />
                  );
                })}
              </div>
            </div>
          )
      )}

      <p>
        <em>
          Empty categories are hidden.
          <br />
          Vendor preview items (such as Vendor subscreens, or Eververse bundles)
          are resolved to their Vendor.
        </em>
      </p>
    </div>
  );
};

export default VendorDetails;

export function displayVendorDetails(tableName: string) {
  return tableName === "DestinyVendorDefinition";
}
