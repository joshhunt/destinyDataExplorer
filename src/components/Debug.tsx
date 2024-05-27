import { useEffect, useState } from "react";

import { store } from "../lib/DefinitionsStore";

export function Debug() {
  const [allKeys, setAllKeys] = useState<IDBValidKey[]>([]);

  useEffect(() => {
    store.getAllKeys().then((result) => {
      setAllKeys(result);
    });
  }, []);

  return (
    <div style={{ fontFamily: "monospace", fontSize: 16 }}>
      <table>
        <thead>
          <tr>
            <td>Primary key</td>
          </tr>
        </thead>

        <tbody>
          {allKeys.map((key, index) => (
            <tr key={index}>
              <td>{serialiseKey(key)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function serialiseKey(key: IDBValidKey): React.ReactNode {
  if (typeof key === "number" || typeof key === "string") {
    return key;
  }

  if (key instanceof Date) {
    return key.toISOString();
  }

  if ("byteLength" in key) {
    throw new Error("ArrayBufferView not supported");
  }

  if (Array.isArray(key)) {
    return "[" + key.map(serialiseKey).join(", ") + "]";
  }

  return key;
}
