import Icon from "components/Icon";
import React from "react";

import s from "./styles.module.scss";

interface ResponseEmptyStateProps {
  loading?: boolean;
}

const ResponseEmptyState: React.FC<ResponseEmptyStateProps> = ({ loading }) => {
  return (
    <div className={s.root}>
      <div>
        {loading ? (
          <span key="a" className={s.loadingRocketIcon}>
            <span className={s.loadingRocketIconInner}>
              <Icon name="rocket-launch" duotone />
            </span>
          </span>
        ) : (
          <span key="b" className={s.rocketIcon}>
            <Icon name="rocket" duotone />
          </span>
        )}
        {loading ? <p>Sending...</p> : <p>Hit Send to get a response</p>}
      </div>
    </div>
  );
};

export default ResponseEmptyState;
