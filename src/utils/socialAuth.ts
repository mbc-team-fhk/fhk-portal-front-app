import type { SocialIdentity } from "../types/socialAuth";

const KAKAO_JS_KEY = import.meta.env.VITE_OAUTH_KAKAO_JS_KEY ?? "e37d5766b64bd8b1c55e31150722eee4";
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_OAUTH_GOOGLE_CLIENT_ID ??
  "103233366910-drc7jv3fpr17mldm6h89lcm8gmsi0lub.apps.googleusercontent.com";

const KAKAO_SDK_SRC = "https://developers.kakao.com/sdk/js/kakao.js";
const GOOGLE_SDK_SRC = "https://accounts.google.com/gsi/client";
const GOOGLE_SCOPE = "openid profile email";

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized?: () => boolean;
      Auth: {
        login: (options: {
          throughTalk?: boolean;
          persistAccessToken?: boolean;
          success: (authObj: { access_token?: string }) => void;
          fail: (error: unknown) => void;
        }) => void;
      };
      API: {
        request: (options: { url: string }) => Promise<{
          id?: number | string;
          kakao_account?: {
            email?: string;
            profile?: {
              nickname?: string;
            };
          };
          properties?: {
            nickname?: string;
          };
        }>;
      };
    };
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string; error_description?: string }) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
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

function getKakaoDisplayName(profile: {
  kakao_account?: { profile?: { nickname?: string } };
  properties?: { nickname?: string };
}) {
  return profile.kakao_account?.profile?.nickname ?? profile.properties?.nickname ?? "Kakao User";
}

export async function loginWithKakao(): Promise<SocialIdentity> {
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

  return new Promise((resolve, reject) => {
    kakao.Auth.login({
      throughTalk: true,
      persistAccessToken: false,
      success: async (authObj) => {
        try {
          const profile = await kakao.API.request({ url: "/v2/user/me" });
          const providerUserId = String(profile.id ?? "").trim();

          if (!providerUserId) {
            throw new Error("카카오 사용자 식별값을 찾지 못했습니다.");
          }

          resolve({
            provider: "kakao",
            providerUserId,
            suggestedLoginId: `kakao_${providerUserId}`,
            displayName: getKakaoDisplayName(profile),
            email: profile.kakao_account?.email,
            accessToken: authObj.access_token,
          });
        } catch (error) {
          reject(error instanceof Error ? error : new Error("카카오 사용자 정보 조회에 실패했습니다."));
        }
      },
      fail: (error) => {
        reject(error instanceof Error ? error : new Error("카카오 로그인에 실패했습니다."));
      },
    });
  });
}

export async function loginWithGoogle(): Promise<SocialIdentity> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("Google Client ID가 설정되지 않았습니다.");
  }

  await loadScript(GOOGLE_SDK_SRC, "google-gsi-sdk");

  const google = window.google;
  if (!google?.accounts?.oauth2) {
    throw new Error("Google Identity Services SDK를 찾을 수 없습니다.");
  }

  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPE,
      callback: async (response) => {
        try {
          if (response.error || !response.access_token) {
            throw new Error(response.error_description || response.error || "구글 로그인에 실패했습니다.");
          }

          const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
            headers: {
              Authorization: `Bearer ${response.access_token}`,
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

          resolve({
            provider: "google",
            providerUserId,
            suggestedLoginId: `google_${providerUserId}`,
            displayName: profile.name ?? "Google User",
            email: profile.email,
            accessToken: response.access_token,
          });
        } catch (error) {
          reject(error instanceof Error ? error : new Error("구글 로그인 처리에 실패했습니다."));
        }
      },
    });

    client.requestAccessToken({ prompt: "consent" });
  });
}
