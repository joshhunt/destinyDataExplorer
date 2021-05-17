import {
  AllDestinyManifestComponents,
  DestinyInventoryItemDefinition,
  DestinyVendorDefinition,
  DestinyVendorItemDefinition,
} from "bungie-api-ts/destiny2";
import BungieImage from "components/BungieImage";
import Item from "components/Item";
import { useDefinition, useDefinitionTable } from "lib/destinyTsUtils";
import { usePathForDefinition } from "lib/pathForDefinitionContext";
import React from "react";
import s from "../styles.module.scss";

interface VendorSaleItemProps {
  vendorDefinition: DestinyVendorDefinition;
  vendorItem: DestinyVendorItemDefinition;
}

const VendorSaleItem: React.FC<VendorSaleItemProps> = ({ vendorItem }) => {
  const pathForItem = usePathForDefinition();
  const itemDefinitions =
    (useDefinitionTable(
      "DestinyInventoryItemDefinition"
    ) as AllDestinyManifestComponents["DestinyInventoryItemDefinition"]) ||
    undefined;

  const itemDef = useDefinition(
    "DestinyInventoryItemDefinition",
    vendorItem.itemHash
  ) as DestinyInventoryItemDefinition | undefined;

  const vendorDef = useDefinition(
    "DestinyVendorDefinition",
    itemDef?.preview?.previewVendorHash
  );

  if (!itemDef) {
    return null;
  }

  const costs = vendorItem.currencies.map((currency) => {
    const currencyItemDef = itemDefinitions?.[currency.itemHash];

    if (!currencyItemDef) {
      return (
        <>
          {currency.quantity} × <em>unknown currency</em>
        </>
      );
    }

    return (
      <>
        <BungieImage
          className={s.inlineIcon}
          src={currencyItemDef.displayProperties.icon}
        />{" "}
        {currencyItemDef.displayProperties.name} × {currency.quantity}
      </>
    );
  });

  return (
    <Item
      pathForItem={pathForItem}
      className={s.item}
      key={vendorItem.vendorItemIndex}
      entry={
        vendorDef
          ? {
              type: "DestinyVendorDefinition",
              def: vendorDef,
            }
          : {
              type: "DestinyInventoryItemDefinition",
              def: itemDef,
            }
      }
      isCollected={false}
      onClick={() => {}}
    >
      <>{costs}</>
    </Item>
  );
};

export default VendorSaleItem;
