import { useMemo } from "react";

import { ProgressRecord } from "../lib/types";

interface LoadingTablesProps {
  loadingState: ProgressRecord;
}

export function LoadingTables({ loadingState }: LoadingTablesProps) {
  const [loadingTables, finishedTables] = useMemo(() => {
    const progress = Object.entries(loadingState).reverse();
    const loadingTables: [string, number][] = [];
    const finishedTables: [string, number][] = [];

    for (const [tableName, [bytes, isFinished]] of progress) {
      const foo: [string, number] = [tableName, bytes];
      if (isFinished) {
        finishedTables.push(foo);
      } else {
        loadingTables.push(foo);
      }
    }

    return [loadingTables, finishedTables];
  }, [loadingState]);

  return (
    <>
      {loadingTables.map(([tableName, bytes]) => {
        return (
          <pre key={tableName}>
            {tableName}
            {new Array(Math.ceil(bytes / 1024 / 1024 / 2)).fill(".").join("")}
          </pre>
        );
      })}
      {finishedTables.map(([tableName]) => {
        return (
          <pre key={tableName} className="finished-table">
            {tableName}
            {" ✔️"}
          </pre>
        );
      })}
    </>
  );
}
