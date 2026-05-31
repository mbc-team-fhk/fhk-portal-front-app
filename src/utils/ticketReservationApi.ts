import type {
    PaymentCallbackResponse,
    PaymentResponse,
    ReservationResponse,
    ScreeningSummary,
    SeatStatusResponse,
} from "../types/ticketReservation";
import type { ApiResponse } from "../types/wrapper";
import { notifyAuthSessionExpired } from "./authSession";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? "http://localhost:4000" : "");
const RESERVATION_API_BASE = `${API_BASE}/api/ticketing/reservation`;
const PAYMENT_API_BASE = `${API_BASE}/api/ticketing/payment`;

export class TicketReservationApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "TicketReservationApiError";
        this.status = status;
    }
}

async function request<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${baseUrl}${path}`, {
        credentials: "include",
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers || {}),
        },
    });

    let payload: ApiResponse<T> | null = null;
    try {
        payload = (await response.json()) as ApiResponse<T>;
    } catch {
        payload = null;
    }

    if (!response.ok || !payload?.isSuccess) {
        if (response.status === 401 || response.status === 403) {
            notifyAuthSessionExpired();
        }

        throw new TicketReservationApiError(payload?.resMessage || `HTTP ${response.status}`, response.status);
    }

    return payload.result;
}

function get<T>(baseUrl: string, path: string): Promise<T> {
    return request<T>(baseUrl, path, { method: "GET" });
}

function post<T>(baseUrl: string, path: string, body?: unknown): Promise<T> {
    return request<T>(baseUrl, path, {
        method: "POST",
        body: body === undefined ? undefined : JSON.stringify(body),
    });
}

export const ticketReservationApi = {
    getScreenings: () => get<ScreeningSummary[]>(RESERVATION_API_BASE, "/demo/screenings"),
    getSeatStatus: (screeningId: number) => get<SeatStatusResponse>(RESERVATION_API_BASE, `/screenings/${screeningId}/seats`),
    createReservation: (screeningId: number, seatIds: number[]) =>
        post<ReservationResponse>(RESERVATION_API_BASE, "/reservations", { screeningId, seatIds }),
    getReservation: (reservationId: number) =>
        get<ReservationResponse>(RESERVATION_API_BASE, `/reservations/${reservationId}`),
    resetDemoData: () => post<{ status: string }>(RESERVATION_API_BASE, "/demo/reset"),
    createPayment: (reservationId: number, amount: number) =>
        post<PaymentResponse>(PAYMENT_API_BASE, "/payments", {
            reservationId,
            amount,
            idempotencyKey: `portal-${reservationId}-${Date.now()}`,
        }),
    approveMockPayment: (paymentNo: string) =>
        post<PaymentCallbackResponse>(PAYMENT_API_BASE, `/mock-pg/payments/${encodeURIComponent(paymentNo)}/success`),
    failMockPayment: (paymentNo: string) =>
        post<PaymentCallbackResponse>(PAYMENT_API_BASE, `/mock-pg/payments/${encodeURIComponent(paymentNo)}/fail`),
};
