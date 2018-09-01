import { makeTypeShort } from 'src/lib/destinyUtils';

const src = (type, fields) => {
  const shortType = makeTypeShort(type);
  return { type, shortType, fields };
};

export default [
  src('DestinyPresentationNodeDefinition', [
    'parentPresentationNodeHashes',
    'parentNodeHashes'
  ]),

  src('DestinyMaterialRequirementSetDefinition', [
    'acquireMaterialRequirementHash'
  ]),

  src('DestinyInventoryItemDefinition', [
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

  src('DestinyVendorDefinition', ['kioskItems', 'previewVendorHash']),

  src('DestinyActivityModeDefinition', [
    'currentActivityModeHash',
    'currentActivityModeHashes',
    'activityModeHashes',
    'parentHashes'
  ]),

  src('DestinyActivityDefinition', [
    'defaultFreeroamActivityHash',
    'currentActivityHash',
    'currentPlaylistActivityHash'
  ]),

  src('DestinyProgressionLevelRequirementDefinition', [
    'progressionLevelRequirementHash'
  ]),

  src('DestinyItemCategoryDefinition', [
    'itemCategoryHashes',
    'groupedCategoryHashes',
    'parentCategoryHashes'
  ]),

  src('DestinyMedalTierDefinition', ['medalTierHash']),
  src('DestinySandboxPerkDefinition', ['perkHash']),
  src('DestinyItemTierTypeDefinition', ['tierTypeHash']),
  src('DestinyPlugSetDefinition', ['reusablePlugSetHash']),

  src('DestinyStatDefinition', ['statTypeHash', 'primaryBaseStatHash']),
  src('DestinyObjectiveDefinition', ['objectiveHashes', 'emblemObjectiveHash'])
];
