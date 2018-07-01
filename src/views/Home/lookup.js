import { makeTypeShort } from 'src/lib/destinyUtils';

const src = (type, fields) => {
  const shortType = makeTypeShort(type);
  return { type, shortType, fields };
};

export default [
  src('DestinyInventoryItemDefinition', [
    'itemHash',
    'singleInitialItemHash',
    'plugItemHash',
    'previewItemOverrideHash',
    'itemList',
    'emblemHash',
    'plugHash',
    'questlineItemHash',
    'summaryItemHash',
    'displayItemHash'
  ]),

  src('DestinyInventoryBucketDefinition', [
    'bucketHash',
    'bucketTypeHash',
    'recoveryBucketTypeHash'
  ]),

  src('DestinyVendorDefinition', [
    'kioskItems',
    'vendorHash',
    'previewVendorHash'
  ]),

  src('DestinyActivityModeDefinition', [
    'currentActivityModeHash',
    'currentActivityModeHashes',
    'activityModeHashes',
    'parentHashes'
  ]),

  src('DestinyActivityTypeDefinition', ['activityTypeHash']),

  src('DestinyVendorGroupDefinition', ['vendorGroupHash']),

  src('DestinyFactionDefinition', ['factionHash']),

  src('DestinyActivityDefinition', [
    'activityHash',
    'defaultFreeroamActivityHash',
    'currentActivityHash',
    'currentPlaylistActivityHash'
  ]),

  src('DestinyPlaceDefinition', 'placeHash'),
  src('DestinyActivityGraphDefinition', 'activityGraphHash'),

  src('DestinyDestinationDefinition', 'destinationHash'),

  src('DestinyProgressionLevelRequirementDefinition', [
    'progressionLevelRequirementHash'
  ]),

  src('DestinyItemCategoryDefinition', [
    'categoryHash',
    'itemCategoryHashes',
    'groupedCategoryHashes',
    'parentCategoryHashes'
  ]),

  src('DestinyLoreDefinition', ['loreHash']),
  src('DestinyRaceDefinition', ['raceHash']),
  src('DestinyClassDefinition', ['classHash']),
  src('DestinyGenderDefinition', ['genderHash']),
  src('DestinySandboxPerkDefinition', ['perkHash']),
  src('DestinyStatGroupDefinition', ['statGroupHash']),
  src('DestinyDamageTypeDefinition', ['damageTypeHash']),
  src('DestinySocketTypeDefinition', ['socketTypeHash']),
  src('DestinyTalentGridDefinition', ['talentGridHash']),
  src('DestinyItemTierTypeDefinition', ['tierTypeHash']),
  src('DestinyProgressionDefinition', ['progressionHash']),
  src('DestinyPlugSetDefinition', ['reusablePlugSetHash']),
  src('DestinyStatDefinition', ['statHash', 'statTypeHash']),
  src('DestinySocketCategoryDefinition', ['socketCategoryHash']),
  src('DestinyObjectiveDefinition', ['objectiveHashes', 'emblemObjectiveHash'])
];
