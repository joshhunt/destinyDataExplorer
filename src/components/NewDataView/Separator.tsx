import React from "react";

import s from "./jsonStyles.module.scss";

interface SeparatorProps {}

const Separator: React.FC<SeparatorProps> = () => {
  return <span className={s.comment}>{" // "}</span>;
};

export default Separator;
