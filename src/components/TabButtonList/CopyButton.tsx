import React, { useState } from "react";
import { copyStr, copyObj } from "lib/copyToClipboard";
import cx from "classnames";
import s from "./styles.module.scss";

export default function CopyButton({ data }: { data: object | string }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <button
      className={cx(s.button, confirm && s.copyConfirm)}
      onClick={() => {
        typeof data === "string" ? copyStr(data) : copyObj(data);
        setConfirm(true);
        setTimeout(() => {
          setConfirm(false);
        }, 3000);
      }}
    >
      {`Copy${typeof data === "string" ? "" : " JSON"}`}
      {confirm && <div className={s.copyConfirm}>Copied!</div>}
    </button>
  );
}
