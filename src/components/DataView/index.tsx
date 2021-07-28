import React from "react";
import { OpenAPIV3 } from "openapi-types";
import JSONTree from "react-json-tree";
import { getPropertySchemaForPath } from "lib/apiSchemaUtils";

import s from "./styles.module.scss";
import LinkedJSONValue from "./LinkedJSONValue";
import EnumJsonValue from "./EnumJsonValue";
import { isImage } from "lib/utils";
import ImageJsonValue from "./ImageJsonValue";
import theme from "./theme";
import CSSThemeVariables from "components/CSSThemeVariables";
import { DefinitionEntry } from "components/DataViewsOverlay/utils";
import CharacterJsonValue, { isCharacterId } from "./CharacterJsonValue";
import { JsonValueCommentAnnotation } from "./JsonValueAnnotation";

interface DataViewProps {
  data: any;
  schema?: OpenAPIV3.SchemaObject;
  linkedDefinitionUrl: (item: DefinitionEntry) => string;
}

const DataView: React.FC<DataViewProps> = ({
  data,
  schema,
  linkedDefinitionUrl,
}) => {
  function valueRenderer(
    displayValue: React.ReactNode,
    rawValue: any,
    ...keyPath: (string | number)[]
  ) {
    return renderWithAccessory(
      data,
      schema,
      linkedDefinitionUrl,
      displayValue,
      rawValue,
      keyPath
    );
  }

  function getItemString(
    type: string,
    childValue: any,
    itemType: React.ReactNode,
    itemString: string,
    keyPath: (string | number)[]
  ) {
    const [rawValue, ...path] = keyPath;
    const displayNode = (
      <>
        {itemType} {itemString}
      </>
    );

    return renderWithAccessory(
      data,
      schema,
      linkedDefinitionUrl,
      displayNode,
      rawValue,
      path
    );
  }

  return (
    <CSSThemeVariables theme={theme}>
      <JSONTree
        theme={{
          tree: s.root,
          ...theme,
        }}
        shouldExpandNode={(keyPath) =>
          keyPath.includes("Response")
            ? keyPath[0] === "data"
              ? keyPath.length < 4
              : keyPath.length < 3
            : keyPath.length < 1
        }
        data={data}
        valueRenderer={valueRenderer}
        getItemString={getItemString}
        hideRoot={true}
      />
    </CSSThemeVariables>
  );
};

// export default DataView;
export default React.memo(DataView);

const NULL_HASH = 2166136261;

function renderWithAccessory(
  data: DataViewProps["data"],
  schema: DataViewProps["schema"],
  linkedDefinitionUrl: DataViewProps["linkedDefinitionUrl"],
  displayValue: React.ReactNode,
  rawValue: any,
  keyPath: (string | number)[]
) {
  const propertySchema = schema && getPropertySchemaForPath(schema, keyPath);
  // if (!propertySchema) return displayValue;

  const displayNode = (
    <span onClick={() => console.log(propertySchema)}>{displayValue}</span>
  );

  const definitionRef = propertySchema?.["x-mapped-definition"];

  const enumRef =
    propertySchema?.["x-enum-reference"] ||
    (propertySchema &&
      "items" in propertySchema &&
      "x-enum-reference" in propertySchema.items &&
      propertySchema.items["x-enum-reference"]);

  if (definitionRef) {
    return (
      <LinkedJSONValue
        value={rawValue}
        schemaRef={definitionRef.$ref}
        linkedDefinitionUrl={linkedDefinitionUrl}
      >
        {displayNode}
      </LinkedJSONValue>
    );
  }

  if (enumRef) {
    return (
      <EnumJsonValue value={rawValue} schemaRef={enumRef.$ref}>
        {displayNode}
      </EnumJsonValue>
    );
  }

  if (isImage(rawValue)) {
    return <ImageJsonValue value={rawValue} />;
  }

  if (isCharacterId(rawValue, data)) {
    return (
      <CharacterJsonValue value={rawValue} data={data}>
        {displayNode}
      </CharacterJsonValue>
    );
  }

  if (rawValue === NULL_HASH) {
    return (
      <JsonValueCommentAnnotation value={rawValue}>
        null hash
      </JsonValueCommentAnnotation>
    );
  }

  return displayNode;
}
