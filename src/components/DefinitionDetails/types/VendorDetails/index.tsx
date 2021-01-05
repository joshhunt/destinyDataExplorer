import {
  DestinyDisplayCategoryDefinition,
  DestinyVendorDefinition,
  DestinyVendorItemDefinition,
} from "bungie-api-ts/destiny2";
import React, { useMemo, useState } from "react";
import VendorSaleItem from "./VendorSaleItem";
import s from "../styles.module.scss";

interface VendorDetailsProps {
  definition: DestinyVendorDefinition;
}

interface Category {
  displayCategory?: DestinyDisplayCategoryDefinition;
  manualName?: string;
  items: DestinyVendorItemDefinition[];
}

const VendorDetails: React.FC<VendorDetailsProps> = ({ definition }) => {
  const [toggle, setToggle] = useState(false);

  const displayCategories = useMemo(() => {
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

  return (
    <div>
      <button onClick={() => setToggle((v) => !v)}>
        {toggle ? "show display categories" : "show categories"}
      </button>

      {toggle ? (
        <div>
          <h3>Categories</h3>

          {definition.categories.map((category) => {
            if (category.vendorItemIndexes.length === 0) {
              return null;
            }

            return (
              <div className={s.category} key={category.categoryIndex}>
                <h4 className={s.cateogryTitle}>
                  #{category.categoryIndex}:{" "}
                  {category.displayTitle || <em>No name</em>}
                </h4>

                <div className={s.categoryItems}>
                  {category.vendorItemIndexes.map((itemIndex) => {
                    const itemSale = definition.itemList[itemIndex];

                    return (
                      <VendorSaleItem vendorItem={itemSale} key={itemIndex} />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <h3>Display categories</h3>

          {displayCategories.map(
            (category, index) =>
              category.items.length > 0 && (
                <div key={index} className={s.category}>
                  <h4 className={s.cateogryTitle}>
                    {category.displayCategory?.displayProperties.name ? (
                      category.displayCategory.displayProperties.name
                    ) : (
                      <em>{category.manualName ?? "No name"}</em>
                    )}

                    {category.displayCategory?.identifier && (
                      <>
                        {" - "} {category.displayCategory.identifier}
                      </>
                    )}
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
        </div>
      )}

      <p>
        <em>Empty categories are hidden</em>
      </p>
    </div>
  );
};

export default VendorDetails;

export function displayVendorDetails(tableName: string) {
  return tableName === "DestinyVendorDefinition";
}
