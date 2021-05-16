import React from "react";
import { SelectBreak } from "components/DataView/JsonValueAnnotation";

import VendorSaleItem from "./VendorSaleItem";
import s from "../styles.module.scss";
import { VendorNormalizedCategory } from "./types";
import { DestinyVendorDefinition } from "bungie-api-ts/destiny2";

interface VendorCategoriesProps {
  definition: DestinyVendorDefinition;
  categories: VendorNormalizedCategory[];
}

const VendorCategories: React.FC<VendorCategoriesProps> = ({
  categories,
  definition,
}) => {
  return (
    <div>
      {categories.map((category, index) => {
        if (category.items.length === 0) {
          return null;
        }

        const hasCategoryIndex = category.categoryIndex !== undefined;

        const matchingInteractions = hasCategoryIndex
          ? definition.interactions.filter(
              (v) =>
                v.rewardVendorCategoryIndex === category.categoryIndex ||
                v.vendorCategoryIndex === category.categoryIndex
            )
          : [];

        return (
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

            {matchingInteractions.length > 0 && (
              <p>
                Reward for{" "}
                {matchingInteractions.length > 1
                  ? "interactions"
                  : "interaction"}
                :{" "}
                <em>
                  {matchingInteractions
                    .map(
                      (v) =>
                        `#${v.interactionIndex} ${v.headerDisplayProperties.name}`
                    )
                    .join(", ")}
                </em>
              </p>
            )}
          </div>
        );
      })}

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

export default VendorCategories;
