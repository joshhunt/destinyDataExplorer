import { DestinyProfileResponse } from "bungie-api-ts/destiny2";
import React from "react";
import s from "./styles.module.scss";

import crossSaveIcon from "./crossSave.png";
import { PlatformIcon } from "components/Icon";

interface MiniProfileCardProps {
  destinyProfile: DestinyProfileResponse | undefined;
}

const MiniProfileCard: React.FC<MiniProfileCardProps> = ({
  destinyProfile,
}) => {
  if (!destinyProfile) {
    return null;
  }

  const userInfo = destinyProfile.profile.data?.userInfo;
  const isCrossSave = userInfo?.membershipType === userInfo?.crossSaveOverride;

  return (
    <div className={s.root}>
      <div className={s.body}>
        <div className={s.iconWell}>
          {isCrossSave ? (
            <img className={s.crossSaveIcon} src={crossSaveIcon} alt="" />
          ) : (
            <PlatformIcon membershipType={userInfo?.membershipType ?? 0} />
          )}
        </div>

        <div className={s.name}>
          {userInfo?.bungieGlobalDisplayName}
          <span className={s.nameSuffix}>
            #
            {userInfo?.bungieGlobalDisplayNameCode?.toString().padStart(4, "0")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MiniProfileCard;
