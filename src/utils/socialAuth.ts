import type { PendingSocialRedirect, SocialIdentity, SocialProvider } from "../types/socialAuth";

const KAKAO_JS_KEY = import.meta.env.VITE_OAUTH_KAKAO_JS_KEY ?? "e37d5766b64bd8b1c55e31150722eee4";
const KAKAO_REST_API_KEY = import.meta.env.VITE_OAUTH_KAKAO_REST_API_KEY ?? "4bebe10f43c592363e8495c9f5071e75";
const KAKAO_REDIRECT_URL = import.meta.env.VITE_OAUTH_KAKAO_REDIRECT_URL ?? "http://localhost:5173/redirect/kakao";
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_OAUTH_GOOGLE_CLIENT_ID ??
  "103233366910-drc7jv3fpr17mldm6h89lcm8gmsi0lub.apps.googleusercontent.com";
const GOOGLE_REDIRECT_URL =
  import.meta.env.VITE_OAUTH_GOOGLE_REDIRECT_URL ?? "http://localhost:5173/redirect/google";

const KAKAO_SDK_SRC = "https://developers.kakao.com/sdk/js/kakao.js";
const GOOGLE_SCOPE = "openid profile email";

export const SOCIAL_REDIRECT_STORAGE_KEY = "fhk.portal.pending-social-redirect";
const SOCIAL_OAUTH_STATE_KEY = "fhk.portal.oauth-state";

type StoredStateMap = Partial<Record<SocialProvider, string>>;

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized?: () => boolean;
      Auth: {
        authorize: (options: {
          redirectUri: string;
          state?: string;
          throughTalk?: boolean;
          scope?: string;
        }) => void;
      };
    };
  }
}

function buildGoogleAuthorizeUrl(state: string) {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URL,
    response_type: "token",
    scope: GOOGLE_SCOPE,
    include_granted_scopes: "true",
    prompt: "select_account",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function readStoredStates(): StoredStateMap {
  try {
    const raw = sessionStorage.getItem(SOCIAL_OAUTH_STATE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredStateMap;
  } catch {
    return {};
  }
}

function writeStoredStates(value: StoredStateMap) {
  sessionStorage.setItem(SOCIAL_OAUTH_STATE_KEY, JSON.stringify(value));
}

function createState(provider: SocialProvider) {
  const randomValue =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const nextState = `${provider}:${randomValue}`;
  const current = readStoredStates();
  current[provider] = nextState;
  writeStoredStates(current);
  return nextState;
}

function validateState(provider: SocialProvider, incomingState?: string) {
  const current = readStoredStates();
  const expectedState = current[provider];

  if (!expectedState) {
    throw new Error("소셜 로그인 상태값을 찾지 못했습니다. 다시 시도해 주세요.");
  }

  if (!incomingState || incomingState !== expectedState) {
    throw new Error("소셜 로그인 상태 검증에 실패했습니다. 다시 시도해 주세요.");
  }

  delete current[provider];
  writeStoredStates(current);
}

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`스크립트를 불러오지 못했습니다: ${src}`));
    document.head.appendChild(script);
  });
}

export async function beginKakaoRedirectLogin() {
  if (!KAKAO_JS_KEY) {
    throw new Error("카카오 JS Key가 설정되지 않았습니다.");
  }

  await loadScript(KAKAO_SDK_SRC, "kakao-sdk");

  const kakao = window.Kakao;
  if (!kakao) {
    throw new Error("카카오 SDK를 찾을 수 없습니다.");
  }

  if (!kakao.isInitialized?.()) {
    kakao.init(KAKAO_JS_KEY);
  }

  const state = createState("kakao");

  kakao.Auth.authorize({
    redirectUri: KAKAO_REDIRECT_URL,
    state,
    throughTalk: true,
  });
}

export function beginGoogleRedirectLogin() {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("Google Client ID가 설정되지 않았습니다.");
  }

  const state = createState("google");
  window.location.assign(buildGoogleAuthorizeUrl(state));
}

export function storePendingSocialRedirect(payload: PendingSocialRedirect) {
  sessionStorage.setItem(SOCIAL_REDIRECT_STORAGE_KEY, JSON.stringify(payload));
}

export function consumePendingSocialRedirect(): PendingSocialRedirect | null {
  try {
    const raw = sessionStorage.getItem(SOCIAL_REDIRECT_STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(SOCIAL_REDIRECT_STORAGE_KEY);
    return JSON.parse(raw) as PendingSocialRedirect;
  } catch {
    sessionStorage.removeItem(SOCIAL_REDIRECT_STORAGE_KEY);
    return null;
  }
}

function getKakaoDisplayName(profile: {
  kakao_account?: { profile?: { nickname?: string } };
  properties?: { nickname?: string };
}) {
  return profile.kakao_account?.profile?.nickname ?? profile.properties?.nickname ?? "Kakao User";
}

async function fetchKakaoIdentity(accessToken: string, authCode?: string): Promise<SocialIdentity> {
  const response = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("카카오 사용자 정보 조회에 실패했습니다.");
  }

  const profile = (await response.json()) as {
    id?: string | number;
    kakao_account?: {
      email?: string;
      profile?: { nickname?: string };
    };
    properties?: { nickname?: string };
  };

  const providerUserId = String(profile.id ?? "").trim();
  if (!providerUserId) {
    throw new Error("카카오 사용자 식별값을 찾지 못했습니다.");
  }

  return {
    provider: "kakao",
    providerUserId,
    suggestedLoginId: `kakao_${providerUserId}`,
    displayName: getKakaoDisplayName(profile),
    email: profile.kakao_account?.email,
    accessToken,
    authCode,
  };
}

async function exchangeKakaoCode(code: string) {
  if (!KAKAO_REST_API_KEY) {
    throw new Error("카카오 REST API Key가 설정되지 않았습니다.");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: KAKAO_REST_API_KEY,
    redirect_uri: KAKAO_REDIRECT_URL,
    code,
  });

  const response = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error("카카오 토큰 요청에 실패했습니다.");
  }

  const payload = (await response.json()) as { access_token?: string };
  const accessToken = String(payload.access_token ?? "").trim();

  if (!accessToken) {
    throw new Error("카카오 액세스 토큰을 받지 못했습니다.");
  }

  return accessToken;
}

async function resolveKakaoRedirect(payload: PendingSocialRedirect) {
  validateState("kakao", payload.state);

  if (payload.error) {
    throw new Error(payload.errorDescription || payload.error || "카카오 로그인에 실패했습니다.");
  }

  if (payload.accessToken) {
    return fetchKakaoIdentity(payload.accessToken, payload.code);
  }

  if (payload.code) {
    const accessToken = await exchangeKakaoCode(payload.code);
    return fetchKakaoIdentity(accessToken, payload.code);
  }

  throw new Error("카카오 인증 결과를 찾지 못했습니다.");
}

async function resolveGoogleRedirect(payload: PendingSocialRedirect) {
  validateState("google", payload.state);

  if (payload.error) {
    throw new Error(payload.errorDescription || payload.error || "구글 로그인에 실패했습니다.");
  }

  const accessToken = String(payload.accessToken ?? "").trim();
  if (!accessToken) {
    throw new Error("구글 액세스 토큰을 받지 못했습니다.");
  }

  const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userInfoResponse.ok) {
    throw new Error("구글 사용자 정보 조회에 실패했습니다.");
  }

  const profile = (await userInfoResponse.json()) as {
    sub?: string;
    email?: string;
    name?: string;
  };

  const providerUserId = String(profile.sub ?? "").trim();
  if (!providerUserId) {
    throw new Error("구글 사용자 식별값을 찾지 못했습니다.");
  }

  return {
    provider: "google",
    providerUserId,
    suggestedLoginId: `google_${providerUserId}`,
    displayName: profile.name ?? "Google User",
    email: profile.email,
    accessToken,
  } satisfies SocialIdentity;
}

export async function resolvePendingSocialRedirect(payload: PendingSocialRedirect): Promise<SocialIdentity> {
  if (payload.provider === "kakao") {
    return resolveKakaoRedirect(payload);
  }

  return resolveGoogleRedirect(payload);
}
