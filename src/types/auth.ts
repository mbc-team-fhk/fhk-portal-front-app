export interface User {
    id: string;
    name: string;
    roles: string[];
}

export interface LoginRequest {
    username: string;
    password: string;
}