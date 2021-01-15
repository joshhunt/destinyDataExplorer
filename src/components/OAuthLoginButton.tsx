import { bungieAuthorizationUrl, RETURN_URL_LS_KEY } from "lib/bungieAuth";
import React, { useCallback } from "react";

interface OAuthLoginButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const OAuthLoginButton: React.FC<OAuthLoginButtonProps> = ({
  children,
  ...rest
}) => {
  const handleLoginClick = useCallback(() => {
    const returnTo = window.location.pathname + window.location.search;
    window.localStorage.setItem(RETURN_URL_LS_KEY, returnTo);
    window.location.href = bungieAuthorizationUrl;
  }, []);

  return (
    <button onClick={handleLoginClick} {...rest}>
      {children}
    </button>
  );
};

export default OAuthLoginButton;
