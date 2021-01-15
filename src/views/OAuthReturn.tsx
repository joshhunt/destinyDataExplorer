import ResponseEmptyState from "components/ResponseEmptyState";
import { useBungieAuth } from "lib/bungieAuth";
import { useQuery } from "lib/utils";
import React from "react";

interface OAuthReturnProps {}

const OAuthReturn: React.FC<OAuthReturnProps> = () => {
  const query = useQuery();
  useBungieAuth(query.code);

  return (
    <div style={{ height: "50vh" }}>
      <ResponseEmptyState loading>
        <p style={{ fontSize: 20 }}>Authorising....</p>
      </ResponseEmptyState>
    </div>
  );
};

export default OAuthReturn;
