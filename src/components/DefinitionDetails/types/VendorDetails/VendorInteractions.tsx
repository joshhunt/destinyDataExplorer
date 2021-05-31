import { DestinyVendorDefinition } from "bungie-api-ts/destiny2";
import React from "react";
import cx from "classnames";

import s from "../styles.module.scss";
import { VendorNormalizedCategory } from "./types";
import VendorSaleItem from "./VendorSaleItem";
import { SelectBreak } from "components/DataView/JsonValueAnnotation";
import { Subtitle2 } from "components/Text";

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
            <Subtitle2>
              {interaction.headerDisplayProperties.name}

              <span className={s.tag}>
                interactionIndex: {interaction.interactionIndex}
              </span>
              <SelectBreak />
            </Subtitle2>

            <blockquote className={s.quoteProse}>
              {interaction.flavorLineOne}
            </blockquote>

            {vendorCategory && (
              <>
                <div className={s.categoryItems}>
                  {vendorCategory.items.map((itemSale) => {
                    return (
                      <VendorSaleItem
                        vendorDefinition={definition}
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
                <div className={s.categoryItems}>
                  {rewardsCategory.items.map((itemSale) => {
                    return (
                      <VendorSaleItem
                        vendorDefinition={definition}
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
