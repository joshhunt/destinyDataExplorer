import React from "react";

import s from "./jsonStyles.module.scss";

interface SelectBreakProps {}

const SelectBreak: React.FC<SelectBreakProps> = () => {
  return <span className={s.noSelect}> </span>;
};

export default SelectBreak;
