export default {
  // Object keys are the keys of the item that this function should return a special value for
  // Functions receive arguments:
  // - prettyValue: the preset pretty formatted value. Use this when you need to display the value
  // - rawValue: the raw value from the item. Use this when you need to programatically use the value
  // - itemPath: the array of keys used to access/identify that value, in reverse order
  //   (so itemPath[0]) will be the key for this value
  // - item: the JSON object being viewed in the data explorer at the moment
  // - definitions: all definitions, keyed by table name. e.g. { DestinyInventoryItemDefinition: {[itemHash]: {...}} }

  // For lowlines - Gets the display name for bubbles on
  // DestinyLocationDefinitions from the data in their related DestinationDefinition
  activityBubbleName(prettyValue, rawValue, itemPath, item, definitions) {
    const locationReleaseIndex = itemPath[1];
    const locationRelease =
      item.locationReleases && item.locationReleases[locationReleaseIndex];

    const destination =
      locationRelease &&
      definitions.DestinyDestinationDefinition[locationRelease.destinationHash];

    const bubble =
      destination && destination.bubbles.find(bub => (bub.hash = rawValue));

    return bubble && `<"${bubble.displayProperties.name}" ${prettyValue}>`;
  }
};
