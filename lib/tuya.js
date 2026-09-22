import crypto from "node:crypto";

const CLIENT_ID = process.env.TUYA_CLIENT_ID;
const CLIENT_SECRET = process.env.TUYA_CLIENT_SECRET;
const ENDPOINT = (process.env.TUYA_ENDPOINT || "https://openapi.tuyaus.com").replace(/\/$/, "");

let tokenCache = {
  accessToken: null,
  expiresAt: 0
};

function assertConfig() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("TUYA_CLIENT_ID ou TUYA_CLIENT_SECRET não configurados.");
  }
}

function sha256(value = "") {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

function hmac(value) {
  return crypto
    .createHmac("sha256", CLIENT_SECRET)
    .update(value, "utf8")
    .digest("hex")
    .toUpperCase();
}

function buildQuery(params = {}) {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));

  if (!entries.length) return "";

  return "?" + entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");
}

function makeHeaders({ method, pathWithQuery, body = "", accessToken = "" }) {
  const t = Date.now().toString();
  const contentHash = sha256(body);
  const stringToSign = [
    method.toUpperCase(),
    contentHash,
    "",
    pathWithQuery
  ].join("\n");

  const signSource = accessToken
    ? `${CLIENT_ID}${accessToken}${t}${stringToSign}`
    : `${CLIENT_ID}${t}${stringToSign}`;

  return {
    client_id: CLIENT_ID,
    sign: hmac(signSource),
    t,
    sign_method: "HMAC-SHA256",
    ...(accessToken ? { access_token: accessToken } : {})
  };
}

async function getToken() {
  assertConfig();

  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.accessToken;
  }

  const path = "/v1.0/token";
  const query = buildQuery({ grant_type: 1 });
  const pathWithQuery = `${path}${query}`;

  const headers = makeHeaders({
    method: "GET",
    pathWithQuery
  });

  const response = await fetch(`${ENDPOINT}${pathWithQuery}`, {
    method: "GET",
    headers
  });

  const data = await response.json();

  if (!response.ok || !data.success || !data.result?.access_token) {
    throw new Error(`Falha ao obter token Tuya: ${JSON.stringify(data)}`);
  }

  const expiresInSeconds = Number(data.result.expire_time || 3600);

  tokenCache = {
    accessToken: data.result.access_token,
    expiresAt: Date.now() + expiresInSeconds * 1000
  };

  return tokenCache.accessToken;
}

export async function tuyaRequest(method, path, { query = {}, body = undefined } = {}) {
  assertConfig();

  const accessToken = await getToken();
  const queryString = buildQuery(query);
  const pathWithQuery = `${path}${queryString}`;
  const bodyString = body === undefined ? "" : JSON.stringify(body);

  const headers = {
    ...makeHeaders({
      method,
      pathWithQuery,
      body: bodyString,
      accessToken
    }),
    ...(body !== undefined ? { "content-type": "application/json" } : {})
  };

  const response = await fetch(`${ENDPOINT}${pathWithQuery}`, {
    method,
    headers,
    ...(body !== undefined ? { body: bodyString } : {})
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(`Erro Tuya em ${method} ${path}: ${JSON.stringify(data)}`);
  }

  return data;
}
