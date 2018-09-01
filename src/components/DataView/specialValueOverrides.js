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
  },
  
  locationHash(prettyValue, rawValue, itemPath, item, definitions) {
    const location = rawValue && definitions.DestinyLocationDefinition[rawValue];
    const vendor = location && location.vendorHash && definitions.DestinyVendorDefinition[location.vendorHash];
    
    const locationRelease = location && location.locationReleases[0];
  
    const destination = locationRelease && definitions.DestinyDestinationDefinition[locationRelease.destinationHash];
    const bubble = destination && destination.bubbles.find(bub => (bub.hash = locationRelease.activityBubbleName));
  
    const activity = locationRelease && definitions.DestinyActivityDefinition[locationRelease.activityHash];
  
    const strings = [];
    
    const vendorString = vendor && `-Vendor "${vendor.displayProperties.name}" ${location.vendorHash}-`;
    const activityString = activity && `-Activity "${activity.displayProperties.name}" ${locationRelease.activityHash}-`;
    const bubbleString = bubble && `-Bubble "${bubble.displayProperties.name}" ${locationRelease.activityBubbleName}-`;
    const destinationString = destination && `-Destination "${destination.displayProperties.name}" ${locationRelease.destinationHash}-`;
    
    if (vendorString) strings.push(vendorString);
    if (activityString && (!destinationString || destination.displayProperties.name != activity.displayProperties.name)) strings.push(activityString);
    if (bubbleString) strings.push(bubbleString);
    if (destinationString) strings.push(destinationString);

    strings.push(`${prettyValue}`);
    return '<Location '+strings.join(' ')+'>';
  }
};
