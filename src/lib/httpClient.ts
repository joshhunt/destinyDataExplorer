import { HttpClient } from "bungie-api-ts/http";

const bungieAPIKey: string | undefined = import.meta.env.VITE_BUNGIE_API_KEY;

if (!bungieAPIKey) {
  throw new Error("VITE_BUNGIE_API_KEY is not defined");
}

export const httpClient: HttpClient = async (config) => {
  const url =
    config.url + "?" + new URLSearchParams(config.params ?? {}).toString();

  const opts = {
    method: config.method,
    headers: {
      "x-api-key": bungieAPIKey,
    },
    body:
      typeof config.body === "string"
        ? config.body
        : JSON.stringify(config.body),
  };

  const req = await fetch(url, opts);
  const data = await req.json();

  return data;
};
