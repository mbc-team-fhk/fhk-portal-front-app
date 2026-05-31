export const AUTH_HINT_KEY = "fhk_portal_authenticated";
export const AUTH_SESSION_EXPIRED_EVENT = "fhk:auth-session-expired";

export function notifyAuthSessionExpired() {
    window.localStorage.removeItem(AUTH_HINT_KEY);
    window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}
