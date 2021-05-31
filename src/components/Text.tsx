import React from "react";

import styles from "styles/typography.module.scss";

interface TextProps {
  size: "h1" | "h2" | "h3" | "h4" | "h5";
  component?: "h1" | "h2" | "h3" | "h4" | "h5" | "span";
}

const Text: React.FC<TextProps> = ({ size, component = "span", children }) => {
  return React.createElement(component, { className: styles[size] }, children);
};

export default Text;

function createHeading(size: TextProps["size"]) {
  return ({ children }: { children: React.ReactNode }) => {
    return <Text size={size} component={size} children={children} />;
  };
}

export const H1 = createHeading("h1");
export const H2 = createHeading("h2");
export const H3 = createHeading("h3");
export const H4 = createHeading("h4");
export const H5 = createHeading("h5");

export const Subtitle1 = createHeading("h3");
export const Subtitle2 = createHeading("h4");
