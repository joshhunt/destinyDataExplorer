import React from "react";

import s from "./jsonStyles.module.scss";

interface JsonValueAnnotationProps {
  value: React.ReactNode;
}

const JsonValueAnnotation: React.FC<JsonValueAnnotationProps> = ({
  value,
  children,
}) => {
  return (
    <>
      {value}
      <SelectBreak />
      <Separator />
      <span className={s.annotation}>{children}</span>
    </>
  );
};

export const SelectBreak: React.FC = () => {
  return <span className={s.noSelect}> </span>;
};

export const Separator: React.FC = () => {
  return <span className={s.comment}>{" // "}</span>;
};

export default JsonValueAnnotation;
