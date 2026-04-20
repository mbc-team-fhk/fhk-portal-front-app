export interface User {
    accountId: number;
    loginId: string;
    nickname: string;
    role: string;
}

export interface LoginRequest {
    loginId: string;
    loginPw: string;
}
