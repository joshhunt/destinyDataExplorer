import useResizeObserver from "@react-hook/resize-observer";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { serialiseKey } from "../lib/defsUtils";
import { PrimaryKey } from "../lib/types";

import { Def } from "./Def";

interface ItemGridProps {
  defsKeys: PrimaryKey[];
}

export function ItemGrid({ defsKeys }: ItemGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const [columnCount, setColumnCount] = useState(8);

  const gridRef = useRef(null);
  useResizeObserver(gridRef, (entry) => {
    const gridComputedStyle = window.getComputedStyle(entry.target);
    const gridColumnCount = gridComputedStyle
      .getPropertyValue("grid-template-columns")
      .split(" ").length;

    setColumnCount(gridColumnCount);
  });

  const parentOffsetRef = useRef(0);

  useLayoutEffect(() => {
    parentOffsetRef.current = parentRef.current?.offsetTop ?? 0;
  }, []);

  const itemsPerRow = columnCount;
  const itemCount = defsKeys?.length ?? 0;
  const rowCount = Math.ceil(itemCount / itemsPerRow);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 68,
    overscan: 0,
    scrollMargin: parentOffsetRef.current,
  });
  const virtualRows = virtualizer.getVirtualItems();

  const measureElement = useCallback(
    (el: HTMLElement | null) => {
      virtualizer.measureElement(el);
    },
    [virtualizer.measureElement]
  );

  return (
    <div ref={parentRef} className="List">
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: "100%",
          position: "relative",
        }}
      >
        <div
          className="Grid"
          ref={gridRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transform: `translateY(${
              (virtualRows[0]?.start ?? 0) - virtualizer.options.scrollMargin
            }px)`,
          }}
        >
          {virtualRows.flatMap((virtualRow) => {
            const virtualKeys = new Array(itemsPerRow)
              .fill(0)
              .map(
                (_, index) => defsKeys[virtualRow.index * itemsPerRow + index]
              );

            return virtualKeys.map((key, index) => {
              if (!key) return;

              return (
                <div
                  key={serialiseKey(key)}
                  data-index={virtualRow.index}
                  ref={index === 0 ? measureElement : undefined}
                  className={
                    virtualRow.index % 2 ? "ListItemOdd" : "ListItemEven"
                  }
                >
                  <div style={{ padding: "10px 0" }}>
                    <Def pkey={key} />
                  </div>
                </div>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
}
