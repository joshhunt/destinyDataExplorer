import React from "react";
import cx from "classnames";

import s from "./styles.module.scss";

interface TabButtonListProps<T = any> {
  options: [T, React.ReactNode][];
  activeTab: T;
  onButtonClick: T;
}

const TabButtonList: React.FC<TabButtonListProps> = ({
  options,
  activeTab,
  onButtonClick,
}) => {
  return (
    <div className={s.root}>
      {options.map(([tabId, tabLabel], index) => (
        <button
          key={index}
          className={cx(s.button, activeTab === tabId && s.active)}
          onClick={() => onButtonClick(tabId)}
        >
          {tabLabel}
        </button>
      ))}
    </div>
  );
};

export default TabButtonList;
