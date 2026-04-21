export type SocialProvider = "kakao" | "google";

export interface SocialIdentity {
  provider: SocialProvider;
  providerUserId: string;
  suggestedLoginId: string;
  displayName: string;
  email?: string;
  accessToken?: string;
  authCode?: string;
}

export interface PendingSocialRedirect {
  provider: SocialProvider;
  code?: string;
  accessToken?: string;
  error?: string;
  errorDescription?: string;
  state?: string;
  tokenType?: string;
}
