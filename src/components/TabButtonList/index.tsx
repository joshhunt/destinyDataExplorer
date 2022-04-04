import React from "react";
import cx from "classnames";

import s from "./styles.module.scss";

export enum TabKind {
  Pretty,
  RawJson,
  Preview,
  VendorCategories,
  VendorDisplayCategories,
  VendorInteractions,
}

interface TabButtonListProps {
  options: (readonly [TabKind, React.ReactNode])[];
  activeTab: TabKind;
  onTabChange: (arg: TabKind) => void;
  additionalTabContent?: JSX.Element;
}

const TabButtonList: React.FC<TabButtonListProps> = ({
  options,
  activeTab,
  onTabChange: onButtonClick,
  additionalTabContent,
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
      {additionalTabContent}
    </div>
  );
};

export default TabButtonList;
