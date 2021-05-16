import { DestinyVendorDefinition } from "bungie-api-ts/destiny2";
import React from "react";
import cx from "classnames";

import s from "../styles.module.scss";
import { VendorNormalizedCategory } from "./types";
import VendorSaleItem from "./VendorSaleItem";

interface VendorInteractionsProps {
  definition: DestinyVendorDefinition;
  categories: VendorNormalizedCategory[];
}

const VendorInteractions: React.FC<VendorInteractionsProps> = ({
  definition,
  categories,
}) => {
  return (
    <div>
      {definition.interactions.map((interaction) => {
        const vendorCategory = categories[interaction.vendorCategoryIndex];
        const rewardsCategory =
          categories[interaction.rewardVendorCategoryIndex];

        return (
          <div className={cx(s.category, s.extraGap)}>
            <h4 className={s.categoryTitle}>
              {interaction.headerDisplayProperties.name}
            </h4>
            <p className={s.prose}>
              <em>{interaction.flavorLineOne}</em>
            </p>

            {vendorCategory && (
              <>
                <h4 className={s.categorySubtitle}>Vendor category</h4>
                <div className={s.categoryItems}>
                  {vendorCategory.items.map((itemSale) => {
                    return (
                      <VendorSaleItem
                        vendorItem={itemSale}
                        key={itemSale.vendorItemIndex}
                      />
                    );
                  })}
                </div>
              </>
            )}

            {rewardsCategory && (
              <>
                <h4 className={s.categorySubtitle}>Reward vendor category</h4>
                <div className={s.categoryItems}>
                  {rewardsCategory.items.map((itemSale) => {
                    return (
                      <VendorSaleItem
                        vendorItem={itemSale}
                        key={itemSale.vendorItemIndex}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default VendorInteractions;
