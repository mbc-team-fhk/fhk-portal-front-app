export interface ScreeningSummary {
    screeningId: number;
    movieTitle: string;
    cinemaName: string;
    screenRoomName: string;
    startsAt: string;
}

export interface SeatSnapshot {
    seatId: number;
    seatRow: string;
    seatNumber: number;
    seatLabel: string;
    price: number;
}

export interface SeatStatusItem extends SeatSnapshot {
    status: SeatOccupancyStatus;
    reservationId: number | null;
    expiresAt: string | null;
}

export interface SeatStatusResponse {
    screeningId: number;
    seats: SeatStatusItem[];
}

export interface ReservationSeat {
    seatId: number;
    seatRow: string;
    seatNumber: number;
    seatLabel: string;
    price: number;
    status: string;
}

export interface ReservationResponse {
    reservationId: number;
    reservationNo: string;
    screeningId: number;
    status: ReservationStatus;
    totalAmount: number;
    expiresAt: string | null;
    reservedAt: string | null;
    canceledAt: string | null;
    seats: ReservationSeat[];
}

export interface PaymentResponse {
    paymentId: number;
    paymentNo: string;
    reservationId: number;
    amount: number;
    status: PaymentStatus;
    requestedAt: string;
    approvedAt: string | null;
    failedAt: string | null;
}

export interface PaymentCallbackLog {
    callbackLogId: number;
    callbackEventId: string;
    paymentNo: string;
    resultStatus: string;
    amount: number;
    processStatus: string;
    message: string;
    receivedAt: string;
}

export interface PaymentCallbackResponse {
    processStatus: string;
    payment: PaymentResponse;
    callbackLog: PaymentCallbackLog;
}

export type SeatOccupancyStatus = "AVAILABLE" | "HELD" | "RESERVED" | string;
export type ReservationStatus = "PENDING_PAYMENT" | "PAID" | "CANCELED" | "EXPIRED" | string;
export type PaymentStatus = "REQUESTED" | "APPROVED" | "FAILED" | string;
