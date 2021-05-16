import React from "react";
import { SelectBreak } from "components/DataView/JsonValueAnnotation";

import VendorSaleItem from "./VendorSaleItem";
import s from "../styles.module.scss";
import { VendorNormalizedCategory } from "./types";

interface VendorCategoriesProps {
  categories: VendorNormalizedCategory[];
}

const VendorCategories: React.FC<VendorCategoriesProps> = ({ categories }) => {
  return (
    <div>
      {categories.map(
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

export default VendorCategories;
