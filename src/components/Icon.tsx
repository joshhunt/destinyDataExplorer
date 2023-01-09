import React from "react";
import cx from "classnames";

interface IconProps {
  name: string;
  solid?: boolean;
  regular?: boolean;
  light?: boolean;
  duotone?: boolean;
  brand?: boolean;
  spin?: boolean;
}

const Icon: React.FC<IconProps> = ({
  name,
  solid,
  regular,
  light,
  duotone,
  brand,
  spin,
  ...rest
}) => {
  const prefix =
    {
      [solid ? "true" : "false"]: "fas",
      [regular ? "true" : "false"]: "far",
      [light ? "true" : "false"]: "fal",
      [duotone ? "true" : "false"]: "fad",
      [brand ? "true" : "false"]: "fab",
    }["true"] || "far";

  return (
    <span
      className={cx(prefix, `fa-${name}`, spin && "fa-spin")}
      {...rest}
    ></span>
  );
};

export default Icon;

const MembershipType = {
  Xbox: 1,
  Playstation: 2,
  Steam: 3,
  BattleNet: 4,
  Stadia: 5,
};

interface PlatformIconProps {
  membershipType: number;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({
  membershipType,
  ...rest
}) => {
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

  return <Icon brand name={iconMap[type as any]} {...rest} />;
};
