import { merge } from "lodash";
import { OpenAPIV3 } from "openapi-types";
import _apispec from "./apispecv3.json";

let apiSpec = _apispec as unknown as OpenAPIV3.Document;

const extensions: Partial<OpenAPIV3.Document> = {
  components: {
    schemas: {
      "Destiny.Definitions.DestinyActivityInteractableDefinition": {
        type: "object",
        properties: {
          entries: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Destiny.Definitions.DestinyActivityInteractableEntriesDefinition",
            },
          },
        },
        description: "Custom definition.",
        "x-mobile-manifest-name": "ActivityInteractable",
      },

      "Destiny.Definitions.DestinyActivityInteractableEntriesDefinition": {
        properties: {
          activityHash: {
            type: "integer",
            format: "uint32",
            "x-mapped-definition": {
              $ref: "#/components/schemas/Destiny.Definitions.DestinyActivityDefinition",
            },
          },
        },
      },

      "Destiny.Definitions.DestinyItemTranslationBlockDefinition": {
        type: "object",
        properties: {
          weaponPatternHash: {
            type: "integer",
            format: "uint32",
            "x-mapped-definition": {
              $ref: "#/components/schemas/Destiny.Definitions.DestinySandboxPatternDefinition",
            },
          },
        },
      },

      "Destiny.Definitions.DestinySandboxPatternDefinition": {
        type: "object",
        properties: {},
        "x-mobile-manifest-name": "SandboxPattern",
      },
    },
  },
};

apiSpec = merge(apiSpec, extensions);

export default apiSpec;
