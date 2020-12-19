import React from "react";

const Icon = ({ name, solid, regular, light, duotone, brand, ...rest }) => {
  const prefix =
    {
      [solid ? "true" : "false"]: "fas",
      [regular ? "true" : "false"]: "far",
      [light ? "true" : "false"]: "fal",
      [duotone ? "true" : "false"]: "fad",
      [brand ? "true" : "false"]: "fab",
    }["true"] || "far";

  return <span className={`${prefix} fa-${name}`} {...rest}></span>;
};

export default Icon;

const MembershipType = {
  Xbox: 1,
  Playstation: 2,
  Steam: 3,
  BattleNet: 4,
  Stadia: 5,
};

export const PlatformIcon = ({ membershipType, ...rest }) => {
  const iconMap = {
    [MembershipType.Xbox]: "xbox",
    [MembershipType.Playstation]: "playstation",
    [MembershipType.Steam]: "steam",
    [MembershipType.BattleNet]: "battle-net",
    [MembershipType.Stadia]: "google",
  };

  const type = membershipType.toString
    ? membershipType.toString()
    : membershipType;

  return <Icon brand name={iconMap[type]} {...rest} />;
};
