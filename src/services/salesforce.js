const CLIENT_ID = process.env.REACT_APP_SF_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_SF_REDIRECT_URI;

const base64UrlEncode = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(hashBuffer);
};

const PKCE_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
const generateCodeVerifier = () => {
  const array = crypto.getRandomValues(new Uint8Array(64));
  return Array.from(array)
    .map((value) => PKCE_CHARSET[value % PKCE_CHARSET.length])
    .join("");
};

const generateCodeChallenge = async (verifier) => {
  return await sha256(verifier);
};

export const loginWithSalesforce = async () => {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  sessionStorage.setItem("sf_pkce_verifier", verifier);

  const sfLoginUrl = "https://login.salesforce.com/services/oauth2/authorize";
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "full refresh_token",
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  window.location.href = `${sfLoginUrl}?${params.toString()}`;
};

export const exchangeCodeForToken = async (code) => {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
  });

  const verifier = sessionStorage.getItem("sf_pkce_verifier");
  if (verifier) {
    params.append("code_verifier", verifier);
  }

  const res = await fetch("/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  return res.json(); // returns { access_token, instance_url, ... }
};
// In salesforce.js — add these functions

export const getValidationRules = async (instanceUrl, accessToken) => {
  const res = await fetch(
    `/sfapi/services/data/v59.0/tooling/query/?q=SELECT+Id,ValidationName,Active,Description,EntityDefinitionId+FROM+ValidationRule+WHERE+EntityDefinition.QualifiedApiName='Account'`,
    {
      headers: {
        instance_url: instanceUrl,
        access_token: accessToken,
      },
    }
  );
  const data = await res.json();
  return data.records;
};

export const toggleValidationRule = async (
  instanceUrl, accessToken, ruleId, currentActiveState
) => {
  // Step 1: Get the MetadataComponentId
  const queryRes = await fetch(
    `/sfapi/services/data/v59.0/tooling/query/?q=SELECT+Id,Metadata+FROM+ValidationRule+WHERE+Id='${ruleId}'`,
    { headers: { instance_url: instanceUrl, access_token: accessToken } }
  );
  const queryData = await queryRes.json();
  const rule = queryData.records[0];

  // Step 2: Patch the metadata to toggle Active
  const updatedMetadata = {
    ...rule.Metadata,
    active: !currentActiveState,
  };

  const patchRes = await fetch(`/sfapi/services/data/v59.0/tooling/sobjects/ValidationRule/${ruleId}`, {
    method: "PATCH",
    headers: {
      instance_url: instanceUrl,
      access_token: accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ Metadata: updatedMetadata }),
  });

  return patchRes.ok;
};