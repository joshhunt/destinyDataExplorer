import {
  DestinyDisplayCategoryDefinition,
  DestinyVendorItemDefinition,
} from "bungie-api-ts/destiny2";

export interface VendorCategory {
  displayCategory?: DestinyDisplayCategoryDefinition;
  manualName?: string;
  items: DestinyVendorItemDefinition[];
}

export interface VendorNormalizedCategory {
  title: string | undefined;
  items: DestinyVendorItemDefinition[];
  tags: string[];
  categoryIndex?: number;
}
