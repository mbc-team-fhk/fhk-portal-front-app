export interface ApiResponse<T> {
    isSuccess: boolean;
    resCode: number;
    resMessage: string;
    result: T;
}