import {
  DestinyLinkedProfilesResponse,
  DestinyProfileResponse,
} from "bungie-api-ts/destiny2";
import { useEffect, useState } from "react";
import { AuthData } from "./bungieAuth";
import { getDestiny } from "./destiny";

export default function useDestinyProfile(authData: AuthData | undefined) {
  const [profile, setProfile] = useState<DestinyProfileResponse>();

  useEffect(() => {
    if (!authData) return;

    getDestiny(
      `/Platform/Destiny2/254/Profile/${authData.bnetMembershipID}/LinkedProfiles/`
    )
      .then((data: DestinyLinkedProfilesResponse) => {
        const [profile] = data.profiles;

        if (!profile) {
          return Promise.reject("No profiles found linked to BNet account");
        }

        return getDestiny(
          `/Platform/Destiny2/${profile.membershipType}/Profile/${profile.membershipId}/?components=100,200`
        );
      })
      .then((data: DestinyProfileResponse) => {
        setProfile(data);
      });
  }, [authData]);

  return profile;
}
