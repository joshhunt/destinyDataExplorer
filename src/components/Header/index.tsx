import React from "react";
import cx from "classnames";
import logo from "../SearchHeader/logo.svg";

import s from "./styles.module.scss";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className, children }) => {
  return (
    <div className={cx(s.root, className)}>
      <div className={s.logoish}>
        <img className={s.logo} src={logo} alt="" />

        <span>API Data Explorer</span>
      </div>

      <div className={s.main}>{children}</div>
    </div>
  );
};

export default Header;
