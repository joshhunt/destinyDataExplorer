import React from "react";
import SelectBreak from "./SelectBreak";
import Separator from "./Separator";

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
      {children}
    </>
  );
};

export default JsonValueAnnotation;
