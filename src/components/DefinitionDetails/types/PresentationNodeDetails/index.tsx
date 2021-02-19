import { DestinyPresentationNodeDefinition } from "bungie-api-ts/destiny2";
import LazyItem from "components/LazyItem";
import React from "react";
import s from "../styles.module.scss";

interface PresentationNodeDetailsProps {
  definition: DestinyPresentationNodeDefinition;
}

const PresentationNodeDetails: React.FC<PresentationNodeDetailsProps> = ({
  definition,
}) => {
  const childPresentationNodes = definition.children?.presentationNodes || [];
  const childRecords = definition.children?.records || [];
  const childCollectibles = definition.children?.collectibles || [];
  const childMetrics = definition.children?.metrics || [];

  return (
    <div>
      {childPresentationNodes.length > 0 && (
        <>
          <h3>Child PresentationNodes</h3>
          <div className={s.itemGrid}>
            {childPresentationNodes.map((node) => (
              <LazyItem
                type="DestinyPresentationNodeDefinition"
                hash={node.presentationNodeHash}
              />
            ))}
          </div>
        </>
      )}

      {childRecords.length > 0 && (
        <>
          <h3>Child Records</h3>
          <div className={s.itemGrid}>
            {childRecords.map((node) => (
              <LazyItem type="DestinyRecordDefinition" hash={node.recordHash} />
            ))}
          </div>
        </>
      )}

      {childCollectibles.length > 0 && (
        <>
          <h3>Child Collectibles</h3>
          <div className={s.itemGrid}>
            {childCollectibles.map((node) => (
              <LazyItem
                type="DestinyCollectibleDefinition"
                hash={node.collectibleHash}
              />
            ))}
          </div>
        </>
      )}

      {childMetrics.length > 0 && (
        <>
          <h3>Child Metrics</h3>
          <div className={s.itemGrid}>
            {childMetrics.map((node) => (
              <LazyItem type="DestinyMetricDefinition" hash={node.metricHash} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PresentationNodeDetails;

export function displayPresentationNodeDetails(tableName: string) {
  return tableName === "DestinyPresentationNodeDefinition";
}
