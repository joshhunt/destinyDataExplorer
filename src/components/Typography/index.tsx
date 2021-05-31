import React from "react";
import cx from "classnames";

import s from "./styles.module.scss";

const CLASS_NAME_MAPPING = {
  h1: s.h1,
  h2: s.h2,
  h3: s.h3,
  h4: s.h4,
  h5: s.h5,
  body: s.article,
};

interface TypographyProps {
  size?: keyof typeof CLASS_NAME_MAPPING;
  component?: "h1" | "h2" | "h3" | "h4" | "h5" | "p" | "span";
  className?: string;
  children: React.ReactNode;
}

const Typography: React.FC<TypographyProps> = ({
  children,
  component,
  size,
  className,
}) => {
  const sizeClassName = size && CLASS_NAME_MAPPING[size];

  return React.createElement(
    component ?? "span",
    {
      className: cx(className, sizeClassName),
    },
    children
  );
};

export default Typography;

function makeHeading(
  size: TypographyProps["size"],
  component?: TypographyProps["component"]
) {
  return (props: TypographyProps) => (
    <Typography {...props} size={size} component={(component as any) ?? size} />
  );
}

export const H1 = makeHeading("h1");
export const H2 = makeHeading("h2");
export const H3 = makeHeading("h3");
export const H4 = makeHeading("h4");
export const H5 = makeHeading("h5");
export const Body = makeHeading("body", "p");
