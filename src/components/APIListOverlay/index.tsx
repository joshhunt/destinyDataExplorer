import Header from "components/Header";
import cx from "classnames";
import Icon from "components/Icon";
import { getApiPaths } from "lib/apiSchemaUtils";
import React, { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import s from "./styles.module.scss";

interface APIListOverlayProps {
  visible?: boolean;
  onRequestClose: () => void;
}

function matches(str: string, filter: string) {
  return str.toLowerCase().includes(filter);
}

const APIListOverlay: React.FC<APIListOverlayProps> = ({
  visible,
  onRequestClose,
}) => {
  const [filter, setFilter] = useState("");

  const apiGroups = useMemo(() => {
    const filterLower = filter.toLowerCase();

    const allPaths = getApiPaths().filter((path) => {
      if (filter.length < 2) {
        return true;
      }

      return (
        matches(path.operationId ?? "", filterLower) ||
        matches(path.path, filterLower)
      );
    });

    // Sort Destiny endpoints to the top
    allPaths.sort((a, b) => {
      const aIsDestiny = a.operationId?.includes("Destiny");
      const bIsDestiny = b.operationId?.includes("Destiny");

      if (aIsDestiny && bIsDestiny) {
        return 0;
      } else if (aIsDestiny && !bIsDestiny) {
        return -1;
      } else if (!aIsDestiny && bIsDestiny) {
        return 1;
      } else {
        return 0;
      }
    });

    const groups: {
      id: string;
      apiPaths: ReturnType<typeof getApiPaths>;
    }[] = [];

    for (const path of allPaths) {
      const groupId = path.operationId?.split(".")[0] ?? "Other";

      let group = groups.find((g) => g.id === groupId);

      if (!group) {
        group = {
          id: groupId,
          apiPaths: [],
        };
        groups.push(group);
      }

      group.apiPaths.push(path);
    }

    return groups;
  }, [filter]);

  const handleBackdropClick = useCallback(
    (ev: React.MouseEvent<HTMLDivElement>) => {
      if (
        ev.target instanceof HTMLDivElement &&
        ev.target.getAttribute("data-root")
      ) {
        onRequestClose();
      }
    },
    [onRequestClose]
  );

  return (
    <div
      className={cx(s.root, visible && s.visible)}
      data-root="true"
      onClick={handleBackdropClick}
    >
      <div className={s.drawer}>
        <div className={s.body}>
          <h2 className={s.title}>API Endpoints</h2>
          <input
            type="text"
            placeholder="Search endpoints"
            className={s.searchField}
            value={filter}
            onChange={(ev) => setFilter(ev.target.value)}
          />

          {apiGroups.length === 0 && (
            <div className={s.noResults}>No results.</div>
          )}

          {apiGroups.map((group) => (
            <div className={s.group}>
              <h3 className={s.groupTitle}>{group.id}</h3>

              {group.apiPaths.map((apiPath) => (
                <Link
                  className={s.apiRequest}
                  to={`/api/${apiPath.operationId}`}
                  onClick={() => onRequestClose()}
                >
                  <div className={s.titleSplit}>
                    <h4 className={s.requestTitle}>{apiPath.operationId}</h4>
                    <span className={s.chevron}>
                      <Icon name="chevron-right" />
                    </span>
                  </div>
                  <p className={s.requestDescription}>{apiPath.description}</p>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default APIListOverlay;
