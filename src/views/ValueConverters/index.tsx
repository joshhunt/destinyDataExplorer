import React, { useMemo, useState } from "react";

interface ValueConvertersProps {}

const ValueConverters: React.FC<ValueConvertersProps> = () => {
  const [input, setInput] = useState("");

  const converted = useMemo(() => {
    const asNumber = Number(input);

    const packageID = (asNumber >> 13) & 0x3ff;
    const entryIndex = asNumber % 0x2000;

    return {
      fileHash: {
        packageID,
        entryIndex,
      },
    };
  }, [input]);

  return (
    <div>
      <h1>Converters</h1>

      <label>
        Input:{" "}
        <input
          type="text"
          value={input}
          onChange={(ev) => setInput(ev.target.value)}
        />
      </label>

      <h2>Output</h2>
      <table>
        <thead>
          <tr>
            <td>Type</td>
            <td>Value</td>
          </tr>
        </thead>

        <tbody>
          <ValueRow name="Package ID" value={converted.fileHash.packageID} />
          <ValueRow name="Entry index" value={converted.fileHash.entryIndex} />
        </tbody>
      </table>
    </div>
  );
};

interface ValueRowProps {
  name: React.ReactNode;
  value: React.ReactNode;
}

const ValueRow: React.FC<ValueRowProps> = ({ name, value }) => {
  return (
    <tr>
      <td>{name}</td>
      <td>{value}</td>
    </tr>
  );
};

export default ValueConverters;
