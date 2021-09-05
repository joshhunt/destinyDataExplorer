import { ServerResponse } from "bungie-api-ts/common";
import { get, set } from "lodash";
import {
  DestinyInventoryBucketDefinition,
  DestinyItemComponent,
  DestinyProfileResponse,
} from "bungie-api-ts/destiny2";
import ComponentLoading from "components/ComponentLoading";
import LazyItem from "components/LazyItem";
import { useDefinition } from "lib/destinyTsUtils";
import React, { Suspense } from "react";
import s from "./styles.module.scss";
import { OpenAPIV3 } from "openapi-types/dist/index";

const NewDataView = React.lazy(() => import("components/DataView"));

interface GetProfileViewProps {
  data: ServerResponse<DestinyProfileResponse>;
  schema?: OpenAPIV3.SchemaObject;
}

interface MetaBucket {
  location: number;
  bucketHash: number;
  equipment: DestinyItemComponent[];
  items: DestinyItemComponent[];
}

const ITEM_LOCATION: Record<number, string> = {
  0: "Unknown",
  1: "Inventory",
  2: "Vault",
  3: "Vendor",
  4: "Postmaster",
};

const GetProfileView: React.FC<GetProfileViewProps> = ({ data, schema }) => {
  const hasInventory =
    data.Response.profileInventory?.data?.items ||
    data.Response.characterInventories?.data ||
    data.Response.characterEquipment?.data;

  return (
    <div>
      {hasInventory ? (
        <Inventory profile={data.Response} schema={schema} />
      ) : (
        <em>Request Inventory components to see it</em>
      )}
    </div>
  );
};

interface InventoryProps {
  profile: DestinyProfileResponse;
  schema?: OpenAPIV3.SchemaObject;
}

const Inventory: React.FC<InventoryProps> = ({ profile, schema }) => {
  const characterIDs = Object.keys(
    (profile.characterInventories?.data || profile.characterEquipment?.data) ??
      {}
  );

  return (
    <div>
      <h2>Inventory</h2>

      {profile.profileInventory?.data?.items && (
        <>
          <h3>Profile inventory</h3>
          <InventoryItems
            inventoryItems={profile.profileInventory?.data?.items}
            profile={profile}
            schema={schema}
          />
        </>
      )}

      {characterIDs.map((characterID) => {
        const inventory =
          profile.characterInventories?.data?.[characterID]?.items;
        const equipment =
          profile.characterEquipment?.data?.[characterID]?.items;

        return (
          <div key={characterID}>
            <h3>Character inventory {characterID}</h3>
            <InventoryItems
              inventoryItems={inventory}
              equipmentItems={equipment}
              characterID={characterID}
              profile={profile}
              schema={schema}
            />
          </div>
        );
      })}
    </div>
  );
};

function InventoryItems({
  inventoryItems,
  equipmentItems,
  characterID,
  profile,
  schema,
}: {
  inventoryItems?: DestinyItemComponent[];
  equipmentItems?: DestinyItemComponent[];
  characterID?: string;
  profile: DestinyProfileResponse;
  schema?: OpenAPIV3.SchemaObject;
}) {
  const inventory: MetaBucket[] = [];

  for (const item of inventoryItems ?? []) {
    let metaBucket = inventory.find(
      (v) => v.bucketHash === item.bucketHash && item.location
    );

    if (!metaBucket) {
      metaBucket = {
        bucketHash: item.bucketHash,
        location: item.location,
        items: [],
        equipment: [],
      };

      inventory.push(metaBucket);
    }

    metaBucket.items.push(item);
  }

  for (const item of equipmentItems ?? []) {
    let metaBucket = inventory.find(
      (v) => v.bucketHash === item.bucketHash && item.location
    );

    if (!metaBucket) {
      metaBucket = {
        bucketHash: item.bucketHash,
        location: item.location,
        items: [],
        equipment: [],
      };

      inventory.push(metaBucket);
    }

    metaBucket.equipment.push(item);
  }

  function getRelatedData(
    item: DestinyItemComponent,
    profile: DestinyProfileResponse,
    characterID?: string
  ): PartialDeep<ServerResponse<DestinyProfileResponse>> {
    const itemInstanceID = item.itemInstanceId;

    const obj = {
      Response: {
        characterEquipment: {
          data: {
            [characterID ?? ""]: {
              items: [item],
            },
          },
        },
      },
    };

    const keys = [
      `itemComponents.instances.data[${itemInstanceID}]`,
      `itemComponents.perks.data[${itemInstanceID}]`,
      `itemComponents.stats.data[${itemInstanceID}]`,
      `itemComponents.sockets.data[${itemInstanceID}]`,
      `itemComponents.reusablePlugs.data[${itemInstanceID}]`,
      `itemComponents.talentGrids.data[${itemInstanceID}]`,
      `itemComponents.objectives.data[${itemInstanceID}]`,
    ];

    for (const key of keys) {
      const value = get(profile, key);
      value && set(obj, `Response.${key}`, value);
    }

    return obj;
  }

  return (
    <div>
      {inventory.map((metaBucket) => {
        return (
          <div key={`${metaBucket.location}-${metaBucket.bucketHash}`}>
            <h4>
              {ITEM_LOCATION[metaBucket.location] ?? metaBucket.location} -{" "}
              <BucketName bucketHash={metaBucket.bucketHash} />
            </h4>

            <div className={s.itemWell}>
              {metaBucket.equipment.map((itemInstance) => (
                <>
                  <LazyItem
                    type="DestinyInventoryItemDefinition"
                    hash={itemInstance.itemHash}
                  >
                    Equipped
                  </LazyItem>
                  <div className={s.inlineDataView}>
                    <Suspense fallback={<ComponentLoading />}>
                      <NewDataView
                        schema={schema}
                        data={getRelatedData(
                          itemInstance,
                          profile,
                          characterID
                        )}
                        linkedDefinitionUrl={() => ""}
                      />
                    </Suspense>
                  </div>
                </>
              ))}

              {metaBucket.items.map((itemInstance) => (
                <LazyItem
                  type="DestinyInventoryItemDefinition"
                  hash={itemInstance.itemHash}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BucketName({ bucketHash }: { bucketHash: number }) {
  const bucketDef = useDefinition(
    "DestinyInventoryBucketDefinition",
    bucketHash
  ) as DestinyInventoryBucketDefinition | undefined;

  if (!bucketDef?.displayProperties.name) {
    return (
      <em>
        Unknown bucket <code>{bucketHash}</code>
      </em>
    );
  }

  return <span>{bucketDef.displayProperties.name}</span>;
}

export default GetProfileView;

// Primitive types (+ Date) are themselves. Or maybe undefined.
type PartialDeep<T> = T extends
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | symbol
  | Date
  ? T | undefined
  : // Arrays, Sets and Maps and their readonly counterparts have their items made
  // deeply partial, but their own instances are left untouched
  T extends Array<infer ArrayType>
  ? Array<PartialDeep<ArrayType>>
  : T extends ReadonlyArray<infer ArrayType>
  ? ReadonlyArray<ArrayType>
  : T extends Set<infer SetType>
  ? Set<PartialDeep<SetType>>
  : T extends ReadonlySet<infer SetType>
  ? ReadonlySet<SetType>
  : T extends Map<infer KeyType, infer ValueType>
  ? Map<PartialDeep<KeyType>, PartialDeep<ValueType>>
  : T extends ReadonlyMap<infer KeyType, infer ValueType>
  ? ReadonlyMap<PartialDeep<KeyType>, PartialDeep<ValueType>>
  : // ...and finally, all other objects.
    {
      [K in keyof T]?: PartialDeep<T[K]>;
    };
