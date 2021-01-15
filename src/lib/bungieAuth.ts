import { useEffect, useState } from "react";
import { useHistory } from "react-router";

const clientId = process.env.REACT_APP_OAUTH_CLIENT_ID;
const clientSecret = process.env.REACT_APP_OAUTH_CLIENT_SECRET;

interface OAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  error_description?: string;
}

interface AuthData {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiration: Date;
  refreshTokenExpiration: Date;
}

const LS_KEY = "dx-auth";
export const RETURN_URL_LS_KEY = "dx-auth-return-url";

export const bungieAuthorizationUrl = `https://www.bungie.net/en/OAuth/Authorize?client_id=${clientId}&response_type=code`;

async function fetchJson<T>(
  input: RequestInfo,
  init?: RequestInit | undefined
): Promise<T> {
  const resp = await fetch(input, init);
  const json = await resp.json();
  return json as T;
}

/**
 * Parses an OAuth token response from Bungie into a better formatted AuthData object
 *
 * @param token OAuth token response from Bungie
 * @param _now Date to use as the base for converting expirations to Date objects. If not supplied, will use new Date()
 */
function parseAuthData(token: OAuthTokenResponse, _now?: Date): AuthData {
  const now = _now || new Date();

  const accessTokenExpiration = new Date();
  const refreshTokenExpiration = new Date();

  accessTokenExpiration.setSeconds(now.getSeconds() + token.expires_in);
  refreshTokenExpiration.setSeconds(
    now.getSeconds() + token.refresh_expires_in
  );

  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    accessTokenExpiration,
    refreshTokenExpiration,
  };
}

/**
 * Requests auth token from Bungie using a given scheme, and returns it as {@link AuthData}
 *
 * @param bodyString the form-urlencoded body to send. See OAuth spec.
 */
async function getToken(bodyString: string): Promise<AuthData> {
  const now = new Date();
  const basicAuth = `${clientId}:${clientSecret}`;

  const tokenResponse = await fetchJson<OAuthTokenResponse>(
    "https://www.bungie.net/Platform/App/OAuth/Token/",
    {
      method: "post",
      body: bodyString,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(basicAuth)}`,
      },
    }
  );

  if (tokenResponse.error_description) {
    throw new Error("Error granting: " + tokenResponse.error_description);
  }

  const authData = parseAuthData(tokenResponse, now);
  localStorage.setItem(LS_KEY, JSON.stringify(authData));

  return authData;
}

/**
 * Requests AuthData from Bungie using the code from the initial user authorization
 *
 * @param code
 */
export async function grantFromAuthCode(code: string): Promise<AuthData> {
  return getToken(`grant_type=authorization_code&code=${code}`);
}

/**
 * Requests AuthData form Bungie using the refresh token from previous authorization
 *
 * @param refreshToken
 */
export async function grantFromRefreshToken(
  refreshToken: string
): Promise<AuthData> {
  return getToken(`grant_type=refresh_token&refresh_token=${refreshToken}`);
}

/**
 * Refreshes the authData if access token has expired. Returns undefined if it cannot be refreshed.
 *
 * @param authData
 */
export async function validateAuthData(
  authData: AuthData
): Promise<AuthData | undefined> {
  if (!hasExpired(authData.accessTokenExpiration)) {
    return authData;
  }

  if (
    hasExpired(authData.accessTokenExpiration) &&
    !hasExpired(authData.refreshTokenExpiration)
  ) {
    return grantFromRefreshToken(authData.refreshToken);
  }

  console.error("Exhausted options to validate auth data", authData);
  return undefined;
}

/**
 * Retrieve the auth data from local storage. Note that this does not validate that
 * it hasnt expired, so be sure to check that after.
 */
export function getAuthDataFromLocalStorage(): AuthData | undefined {
  const lsValue = localStorage.getItem(LS_KEY);
  const parsed = lsValue && JSON.parse(lsValue);

  if (!parsed) {
    return undefined;
  }

  const {
    accessToken,
    refreshToken,
    accessTokenExpiration,
    refreshTokenExpiration,
  } = parsed;

  if (
    accessToken &&
    typeof accessToken === "string" &&
    refreshToken &&
    typeof refreshToken === "string" &&
    accessTokenExpiration &&
    typeof accessTokenExpiration === "string" &&
    refreshTokenExpiration &&
    typeof refreshTokenExpiration === "string"
  ) {
    return {
      accessToken,
      refreshToken,
      accessTokenExpiration: new Date(accessTokenExpiration),
      refreshTokenExpiration: new Date(refreshTokenExpiration),
    };
  }

  return undefined;
}

export async function getValidAuthData(): Promise<AuthData | undefined> {
  const authData = getAuthDataFromLocalStorage();

  if (!authData) return undefined;

  return await validateAuthData(authData);
}

function hasExpired(date: Date) {
  const now = new Date();
  return date < now;
}

export function useBungieAuth(code?: string) {
  const rHistory = useHistory();
  const [authData, setAuthData] = useState<AuthData>();

  useEffect(() => {
    if (!code) {
      getValidAuthData().then((_authData) => setAuthData(_authData));
      return;
    }

    grantFromAuthCode(code).then((_authData) => {
      setAuthData(_authData);
      const returnTo = window.localStorage.getItem(RETURN_URL_LS_KEY) || "/";
      rHistory.push(returnTo);
    });
  }, [code, rHistory]);

  return authData;
}
