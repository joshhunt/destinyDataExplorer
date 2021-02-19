import { AllDestinyManifestComponents } from "bungie-api-ts/destiny2";
import Item from "components/Item";
import { usePathForDefinition } from "lib/pathForDefinitionContext";
import { useDefinition } from "lib/destinyTsUtils";
import React from "react";

interface LazyItemProps {
  hash: string | number;
  type: keyof AllDestinyManifestComponents;
  className?: string;
  onClick?: () => void;
}

const LazyItem: React.FC<LazyItemProps> = ({
  hash,
  type,
  className,
  onClick,
}) => {
  const pathForItem = usePathForDefinition();
  const definition = useDefinition(type, hash);

  return (
    <Item
      pathForItem={pathForItem}
      className={className}
      isCollected={false}
      onClick={onClick}
      entry={{
        type,
        def: definition,
      }}
    />
  );
};

export default LazyItem;
