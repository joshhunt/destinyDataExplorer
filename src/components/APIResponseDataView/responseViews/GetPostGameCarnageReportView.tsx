import { ServerResponse } from "bungie-api-ts/common";
import {
  DestinyPostGameCarnageReportData,
  DestinyPostGameCarnageReportEntry,
} from "bungie-api-ts/destiny2";
import BungieImage from "components/BungieImage";
import React, { Suspense } from "react";
import "react-data-grid/dist/react-data-grid.css";

import s from "./styles.module.scss";

const LazyDataGrid = React.lazy(() => import("react-data-grid"));

// import LazyDataGrid from "react-data-grid";

interface FormatterArg {
  row: DestinyPostGameCarnageReportEntry;
}

interface GetPostGameCarnageReportProps {
  data: ServerResponse<DestinyPostGameCarnageReportData>;
}

const GetPostGameCarnageReport: React.FC<GetPostGameCarnageReportProps> = ({
  data,
}) => {
  // const rows = data.Response.entries.map((entry) => {
  //   return Object.fromEntries(
  //     Object.entries(entry.values).map(([key, value]) => {
  //       return [key, value.basic.value];
  //     })
  //   );
  // });

  const rows = data.Response.entries;

  const firstEntry = rows[0];

  const columns = Object.entries(firstEntry.values).map(([key]) => ({
    key: `values.${key}.basic`,
    name: key,
    resizable: true,
    frozen: false,
    width: undefined as undefined | number,
    formatter: ({ row }: FormatterArg) => {
      const { displayValue } = row.values[key].basic;

      return <>{displayValue}</>;
    },
  }));

  columns.unshift({
    key: "values.characterId",
    name: "Player",
    resizable: true,
    frozen: true,
    width: 175,
    formatter: ({ row }: FormatterArg) => {
      return <Player entry={row} />;
    },
  });

  return (
    <div>
      <p>This is still a work in progress :)</p>

      <Suspense fallback="Loading...">
        <LazyDataGrid
          columns={columns}
          rows={rows}
          rowHeight={46}
          style={{ minHeight: "55vh" }}
        ></LazyDataGrid>
      </Suspense>
    </div>
  );
};

interface PlayerProps {
  entry: DestinyPostGameCarnageReportEntry;
}

const Player: React.FC<PlayerProps> = ({ entry }) => {
  return (
    <div className={s.player}>
      <div className={s.playerAccessory}>
        <BungieImage
          className={s.playerEmblem}
          src={entry.player.destinyUserInfo.iconPath}
        />
      </div>
      <div className={s.playerMain}>
        <div className={s.playerName}>
          {entry.player.destinyUserInfo.displayName}
        </div>
        <div className={s.playerDescription}>{entry.player.characterClass}</div>
      </div>
    </div>
  );
};

export default GetPostGameCarnageReport;
