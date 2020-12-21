import NewDataView from "components/NewDataView";
import { getSchemaFromDefinitionName } from "lib/apiSchemaUtils";
import { definitionFromStore } from "lib/destinyTsUtils";
import { notEmpty } from "lib/utils";
import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { ReduxStore } from "types";
import s from "./styles.module.scss";
import { DefinitionEntry } from "./utils";

interface DataViewsOverlayProps {
  items: DefinitionEntry[];
  linkedDefinitionUrl: (item: DefinitionEntry) => string;
  requestPopOverlay: () => void;
}

const DataViewsOverlay: React.FC<DataViewsOverlayProps> = ({
  items,
  linkedDefinitionUrl,
  requestPopOverlay,
}) => {
  const definitions = useSelector((store: ReduxStore) =>
    items
      .map((item) => {
        const definition = definitionFromStore(store, item.type, item.hash);

        if (!definition) {
          return null;
        }

        const cleanedDef = {
          ...definition,
        };

        // @ts-ignore
        delete definition.$type;

        return {
          ...item,
          definition: cleanedDef,
        };
      })
      .filter(notEmpty)
  );

  const onLayerClick = useCallback(
    (ev: React.MouseEvent<HTMLDivElement>) => {
      if (
        ev.target instanceof HTMLDivElement &&
        ev.target.getAttribute("data-root")
      ) {
        requestPopOverlay();
      }
    },
    [requestPopOverlay]
  );

  return (
    <div>
      <TransitionGroup>
        {definitions.map(({ type, definition }, index) => (
          <CSSTransition
            key={index}
            classNames="global-dataview-animation"
            timeout={{ enter: 200, exit: 200 }}
          >
            <div className={s.layer} data-root="true" onClick={onLayerClick}>
              <div className={s.data} style={{ left: 100 * (index + 1) }}>
                <NewDataView
                  data={definition}
                  schema={getSchemaFromDefinitionName(type)}
                  linkedDefinitionUrl={linkedDefinitionUrl}
                />
              </div>
            </div>
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  );
};

export default DataViewsOverlay;
export * from "./utils";
