import { DestinyVendorDefinition } from "bungie-api-ts/destiny2";
import React, { useMemo, useState } from "react";
import TabButtonList, { TabKind } from "components/TabButtonList";
import { notEmpty } from "lib/utils";
import { VendorCategory, VendorNormalizedCategory } from "./types";
import VendorCategories from "./VendorCategories";
import VendorInteractions from "./VendorInteractions";

interface VendorDetailsProps {
  definition: DestinyVendorDefinition;
}

const VendorDetails: React.FC<VendorDetailsProps> = ({ definition }) => {
  const [activeTab, setActiveTab] = useState(TabKind.VendorCategories);

  const displayCategoriesData = useMemo(() => {
    const categories: VendorCategory[] =
      definition.displayCategories?.map((displayCategory) => ({
        displayCategory,
        items: [],
      })) ?? [];

    const negativeOneCategory: VendorCategory = {
      manualName: "-1 uncategorised items",
      items: [],
    };

    const fallbackCategory: VendorCategory = {
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

  const displayCategories: VendorNormalizedCategory[] =
    displayCategoriesData.map((category) => ({
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
    }));

  const categories: VendorNormalizedCategory[] = definition.categories.map(
    (category) => ({
      title: category.displayTitle,
      items: category.vendorItemIndexes.map((v) => definition.itemList[v]),
      tags: [`categoryIndex: ${category.categoryIndex}`],
      categoryIndex: category.categoryIndex,
    })
  );

  return (
    <div>
      <TabButtonList
        onTabChange={(tabId) => setActiveTab(tabId)}
        activeTab={activeTab}
        options={[
          [TabKind.VendorCategories, "Categories"] as const,
          [TabKind.VendorDisplayCategories, "Display categories"] as const,
          [TabKind.VendorInteractions, "Interactions"] as const,
        ]}
      />

      {activeTab === TabKind.VendorCategories && (
        <VendorCategories categories={categories} definition={definition} />
      )}

      {activeTab === TabKind.VendorDisplayCategories && (
        <VendorCategories
          categories={displayCategories}
          definition={definition}
        />
      )}

      {activeTab === TabKind.VendorInteractions && (
        <VendorInteractions definition={definition} categories={categories} />
      )}
    </div>
  );
};

export default VendorDetails;

export function displayVendorDetails(tableName: string) {
  return tableName === "DestinyVendorDefinition";
}
