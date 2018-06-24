const src = (type, fields) => {
  const match = type.match(/Destiny(\w+)Definition/);
  const shortType = match ? match[1] : type;
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
    'questlineItemHash'
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
    'currentActivityModeHashes'
  ]),

  src('DestinyActivityDefinition', [
    'activityHash',
    'currentActivityHash',
    'currentPlaylistActivityHash'
  ]),

  src('DestinyProgressionLevelRequirementDefinition', [
    'progressionLevelRequirementHash'
  ]),

  src('DestinyItemCategoryDefinition', [
    'categoryHash',
    'itemCategoryHashes',
    'groupedCategoryHashes'
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
