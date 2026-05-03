import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type {
    PaymentResponse,
    ReservationResponse,
    ScreeningSummary,
    SeatStatusItem,
} from "../types/ticketReservation";
import { TicketReservationApiError, ticketReservationApi } from "../utils/ticketReservationApi";

const statusLabels: Record<string, string> = {
    AVAILABLE: "선택 가능",
    HELD: "결제 대기",
    RESERVED: "예매 완료",
    CONFIRMED: "예매 완료",
    PENDING_PAYMENT: "결제 대기",
    PAID: "결제 완료",
    CANCELED: "취소",
    EXPIRED: "만료",
    REQUESTED: "결제 요청",
    APPROVED: "승인 완료",
    FAILED: "결제 실패",
};

function formatDate(value: string | null | undefined) {
    if (!value) {
        return "-";
    }

    return new Intl.DateTimeFormat("ko-KR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatSeatLabels(seats: { seatLabel: string }[]) {
    return seats.map((seat) => seat.seatLabel).join(", ");
}

function getPaymentHandledAt(payment: PaymentResponse) {
    return payment.approvedAt || payment.failedAt || null;
}

function getSeatClass(seat: SeatStatusItem, selected: boolean) {
    const visualStatus = seat.status === "CONFIRMED" ? "reserved" : seat.status.toLowerCase();
    return `seat-button is-${visualStatus}${selected ? " is-selected" : ""}`;
}

function isPaymentExpiredError(error: unknown) {
    if (!(error instanceof TicketReservationApiError)) {
        return false;
    }

    return error.status === 409
        || error.status === 410
        || error.message.includes("만료")
        || error.message.toLowerCase().includes("expired");
}

function isAuthExpiredError(error: unknown) {
    return error instanceof TicketReservationApiError && (error.status === 401 || error.status === 403);
}

function getTicketErrorMessage(error: unknown, fallback: string) {
    if (isAuthExpiredError(error)) {
        return "로그인 세션이 만료되었습니다. 다시 로그인해 주세요.";
    }

    return error instanceof Error ? error.message : fallback;
}

export default function TicketReservationsPage() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [screenings, setScreenings] = useState<ScreeningSummary[]>([]);
    const [selectedScreeningId, setSelectedScreeningId] = useState<number | null>(null);
    const [seats, setSeats] = useState<SeatStatusItem[]>([]);
    const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
    const [reservation, setReservation] = useState<ReservationResponse | null>(null);
    const [payment, setPayment] = useState<PaymentResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [seatsLoading, setSeatsLoading] = useState(false);
    const [seatsRefreshing, setSeatsRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [conflictMessage, setConflictMessage] = useState<string | null>(null);
    const [paymentExpiredMessage, setPaymentExpiredMessage] = useState<string | null>(null);

    const selectedScreening = useMemo(
        () => screenings.find((screening) => screening.screeningId === selectedScreeningId) || null,
        [screenings, selectedScreeningId],
    );

    const selectedSeats = useMemo(
        () => seats.filter((seat) => selectedSeatIds.includes(seat.seatId)),
        [seats, selectedSeatIds],
    );

    const seatRows = useMemo(() => {
        const rows = new Map<string, SeatStatusItem[]>();

        seats.forEach((seat) => {
            const rowSeats = rows.get(seat.seatRow) || [];
            rowSeats.push(seat);
            rows.set(seat.seatRow, rowSeats);
        });

        return Array.from(rows.entries())
            .sort(([left], [right]) => right.localeCompare(left))
            .map(([seatRow, rowSeats]) => ({
                seatRow,
                seats: rowSeats.sort((left, right) => left.seatNumber - right.seatNumber),
            }));
    }, [seats]);

    const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    const refreshSeats = async (showLoading = true) => {
        if (!selectedScreeningId) {
            return;
        }

        const shouldBlockSeatMap = showLoading && seats.length === 0;

        if (showLoading) {
            setSeatsRefreshing(true);
            setMessage(null);

            if (shouldBlockSeatMap) {
                setSeatsLoading(true);
            }
        }

        try {
            const result = await ticketReservationApi.getSeatStatus(selectedScreeningId);
            setSeats(result.seats);
            setSelectedSeatIds((current) =>
                current.filter((seatId) => result.seats.some((seat) => seat.seatId === seatId && seat.status === "AVAILABLE")),
            );
        } catch (error) {
            if (showLoading) {
                setMessage(getTicketErrorMessage(error, "좌석 상태를 새로고침하지 못했습니다."));
            }
        } finally {
            if (showLoading) {
                setSeatsRefreshing(false);

                if (shouldBlockSeatMap) {
                    setSeatsLoading(false);
                }
            }
        }
    };

    useEffect(() => {
        const loadScreenings = async () => {
            setLoading(true);
            setMessage(null);

            try {
                const result = await ticketReservationApi.getScreenings();
                setScreenings(result);
                setSelectedScreeningId(result[0]?.screeningId ?? null);
            } catch (error) {
                setMessage(getTicketErrorMessage(error, "상영 목록을 불러오지 못했습니다."));
            } finally {
                setLoading(false);
            }
        };

        loadScreenings();
    }, []);

    useEffect(() => {
        if (!selectedScreeningId) {
            setSeats([]);
            return;
        }

        setSelectedSeatIds([]);
        setReservation(null);
        setPayment(null);
        refreshSeats();
    }, [selectedScreeningId]);

    const toggleSeat = (seat: SeatStatusItem) => {
        if (seat.status !== "AVAILABLE") {
            return;
        }

        setSelectedSeatIds((current) =>
            current.includes(seat.seatId)
                ? current.filter((seatId) => seatId !== seat.seatId)
                : [...current, seat.seatId],
        );
    };

    const handleReserve = async () => {
        if (!selectedScreeningId || selectedSeatIds.length === 0) {
            setMessage("예매할 좌석을 선택해주세요.");
            return;
        }

        setActionLoading(true);
        setMessage(null);

        try {
            const result = await ticketReservationApi.createReservation(selectedScreeningId, selectedSeatIds);
            setReservation(result);
            setPayment(null);
            setMessage("예약이 생성되었습니다. 결제 요청을 진행할 수 있습니다.");
            await refreshSeats();
        } catch (error) {
            if (error instanceof TicketReservationApiError && error.status === 409) {
                setConflictMessage(error.message);
                return;
            }

            setMessage(getTicketErrorMessage(error, "예약 생성에 실패했습니다."));
        } finally {
            setActionLoading(false);
        }
    };

    const closeConflictModal = async () => {
        setConflictMessage(null);
        await refreshSeats();
    };

    const closePaymentExpiredModal = async () => {
        setPaymentExpiredMessage(null);
        setPayment(null);

        if (reservation) {
            try {
                const updatedReservation = await ticketReservationApi.getReservation(reservation.reservationId);
                setReservation(updatedReservation);
            } catch {
                setReservation(null);
            }
        }

        await refreshSeats();
    };

    const handleCreatePayment = async () => {
        if (!reservation) {
            return;
        }

        setActionLoading(true);
        setMessage(null);

        try {
            const result = await ticketReservationApi.createPayment(reservation.reservationId, reservation.totalAmount);
            setPayment(result);
            setMessage("결제 요청이 생성되었습니다. Mock PG 승인/실패를 테스트할 수 있습니다.");
        } catch (error) {
            setMessage(getTicketErrorMessage(error, "결제 요청 생성에 실패했습니다."));
        } finally {
            setActionLoading(false);
        }
    };

    const handleMockPayment = async (mode: "success" | "fail") => {
        if (!payment) {
            return;
        }

        setActionLoading(true);
        setMessage(null);

        try {
            const result =
                mode === "success"
                    ? await ticketReservationApi.approveMockPayment(payment.paymentNo)
                    : await ticketReservationApi.failMockPayment(payment.paymentNo);
            setPayment(result.payment);

            if (reservation) {
                const updatedReservation = await ticketReservationApi.getReservation(reservation.reservationId);
                setReservation(updatedReservation);
            }

            await refreshSeats();
            setMessage(mode === "success" ? "Mock 결제가 승인되었습니다." : "Mock 결제가 실패 처리되었습니다.");
        } catch (error) {
            if (isPaymentExpiredError(error)) {
                setPaymentExpiredMessage("결제 가능시간이 만료되었습니다.");
                return;
            }

            setMessage(getTicketErrorMessage(error, "Mock 결제 처리에 실패했습니다."));
        } finally {
            setActionLoading(false);
        }
    };

    const handleResetDemo = async () => {
        setActionLoading(true);
        setMessage(null);

        try {
            await ticketReservationApi.resetDemoData();
            setReservation(null);
            setPayment(null);
            await refreshSeats();
            setMessage("데모 좌석 데이터가 초기화되었습니다.");
        } catch (error) {
            setMessage(getTicketErrorMessage(error, "데모 데이터 초기화에 실패했습니다."));
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="ticket-page">
            <section className="ticket-hero">
                <div className="shell ticket-hero-inner">
                    <div>
                        <div className="eyebrow">Ticket Reservation</div>
                        <h1>상영 선택부터 좌석 점유, 결제 콜백까지 한 화면에서 확인합니다.</h1>
                        <p>
                            reservation-service의 데모 상영/좌석 API를 조회하고, 로그인 상태에서 예약 생성과
                            payment-service Mock PG 흐름까지 이어서 테스트할 수 있습니다.
                        </p>
                    </div>
                    <div className="ticket-hero-panel">
                        <span>services</span>
                        <strong>reservation-service</strong>
                        <strong>payment-service</strong>
                    </div>
                </div>
            </section>

            <main className="shell ticket-workspace">
                {message && (
                    <div className="ticket-empty" role="alert">
                        {message}
                    </div>
                )}
                <section className="ticket-section">
                    <div className="ticket-section-heading">
                        <div>
                            <h2>상영 목록</h2>
                            <p>데모 카탈로그에서 예매할 상영을 선택하세요.</p>
                        </div>
                        <button className="secondary-button" type="button" onClick={handleResetDemo} disabled={actionLoading || seatsLoading}>
                            데모 초기화
                        </button>
                    </div>

                    {loading ? (
                        <div className="ticket-empty">상영 정보를 불러오는 중입니다.</div>
                    ) : (
                        <div className="screening-grid">
                            {screenings.map((screening) => (
                                <button
                                    className={`screening-card${screening.screeningId === selectedScreeningId ? " is-active" : ""}`}
                                    key={screening.screeningId}
                                    onClick={() => setSelectedScreeningId(screening.screeningId)}
                                    type="button"
                                >
                                    <span>{screening.cinemaName}</span>
                                    <strong>{screening.movieTitle}</strong>
                                    <small>
                                        {screening.screenRoomName} · {formatDate(screening.startsAt)}
                                    </small>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                <section className="ticket-grid-layout">
                    <div className="ticket-section">
                        <div className="ticket-section-heading">
                            <div>
                                <h2>좌석 선택</h2>
                                <p>{selectedScreening ? `${selectedScreening.movieTitle} / ${formatDate(selectedScreening.startsAt)}` : "상영을 먼저 선택하세요."}</p>
                            </div>
                            <button
                                aria-label="좌석 새로고침"
                                className={`secondary-button ticket-icon-button${seatsRefreshing ? " is-refreshing" : ""}`}
                                disabled={seatsLoading || seatsRefreshing || !selectedScreeningId}
                                onClick={() => void refreshSeats()}
                                title="좌석 새로고침"
                                type="button"
                            >
                                <img alt="" aria-hidden="true" className="refresh-icon" src="/images/reload-icon.png" />
                            </button>
                        </div>

                        <div className="screen-indicator">SCREEN</div>
                        {seatsLoading ? (
                            <div className="ticket-empty">좌석 상태를 불러오는 중입니다.</div>
                        ) : (
                            <div className="seat-map">
                                {seatRows.map((row) => (
                                    <div className="seat-row" key={row.seatRow}>
                                        <span className="seat-row-label">{row.seatRow}</span>
                                        {row.seats.map((seat) => {
                                            const selected = selectedSeatIds.includes(seat.seatId);
                                            return (
                                                <button
                                                    className={getSeatClass(seat, selected)}
                                                    disabled={seat.status !== "AVAILABLE"}
                                                    key={seat.seatId}
                                                    onClick={() => toggleSeat(seat)}
                                                    title={`${seat.seatLabel} ${statusLabels[seat.status] || seat.status}`}
                                                    type="button"
                                                >
                                                    {seat.seatNumber}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="seat-legend">
                            <span><i className="legend-dot is-available" />일반석</span>
                            <span><i className="legend-dot is-selected" />선택됨</span>
                            <span><i className="legend-dot is-reserved" />예매완료(결제대기)</span>
                        </div>

                        <div className="seat-legend" hidden>
                            <span><i className="legend-dot is-available" />선택 가능</span>
                            <span><i className="legend-dot is-selected" />선택됨</span>
                            <span><i className="legend-dot is-held" />결제 대기</span>
                            <span><i className="legend-dot is-reserved" />예매 완료</span>
                        </div>
                    </div>

                    <aside className="ticket-section ticket-summary">
                        <h2>예매 요약</h2>
                        {selectedSeats.length === 0 ? (
                            <div className="ticket-empty compact">선택한 좌석이 없습니다.</div>
                        ) : (
                            <div className="selected-seat-list">
                                {selectedSeats.map((seat) => (
                                    <div className="selected-seat-row" key={seat.seatId}>
                                        <span>{seat.seatLabel}</span>
                                        <strong>{formatCurrency(seat.price)}</strong>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="summary-total">
                            <span>합계</span>
                            <strong>{formatCurrency(totalAmount)}</strong>
                        </div>

                        {!authLoading && !isAuthenticated && (
                            <div className="login-required">
                                예약 생성은 로그인이 필요합니다. <Link to="/login">로그인 페이지</Link>
                            </div>
                        )}

                        <button
                            className="primary-button ticket-full-button"
                            disabled={!isAuthenticated || actionLoading || selectedSeatIds.length === 0}
                            onClick={handleReserve}
                            type="button"
                        >
                            예약 생성
                        </button>

                        {reservation && (
                            <div className="result-panel">
                                <h3>예약 결과</h3>
                                <dl>
                                    <dt>예약 번호</dt>
                                    <dd>{reservation.reservationNo}</dd>
                                    <dt>좌석</dt>
                                    <dd>{formatSeatLabels(reservation.seats)}</dd>
                                    <dt>결제금액</dt>
                                    <dd>{formatCurrency(reservation.totalAmount)}</dd>
                                    <dt>상태</dt>
                                    <dd>{statusLabels[reservation.status] || reservation.status}</dd>
                                    <dt>만료 시간</dt>
                                    <dd>{formatDate(reservation.expiresAt)}</dd>
                                </dl>
                                <button
                                    className="secondary-button ticket-full-button"
                                    disabled={actionLoading || reservation.status !== "PENDING_PAYMENT"}
                                    hidden={reservation.status !== "PENDING_PAYMENT"}
                                    onClick={handleCreatePayment}
                                    type="button"
                                >
                                    결제 요청 생성
                                </button>
                            </div>
                        )}

                        {payment && (
                            <div className="result-panel">
                                <h3>결제 결과</h3>
                                <dl>
                                    <dt>결제 번호</dt>
                                    <dd>{payment.paymentNo}</dd>
                                    <dt>결제금액</dt>
                                    <dd>{formatCurrency(payment.amount)}</dd>
                                    <dt>상태</dt>
                                    <dd>{statusLabels[payment.status] || payment.status}</dd>
                                    <dt>요청시간</dt>
                                    <dd>{formatDate(payment.requestedAt)}</dd>
                                    {getPaymentHandledAt(payment) && (
                                        <>
                                            <dt>{payment.approvedAt ? "승인시간" : "실패시간"}</dt>
                                            <dd>{formatDate(getPaymentHandledAt(payment))}</dd>
                                        </>
                                    )}
                                </dl>
                                <div className="payment-actions" hidden={payment.status !== "REQUESTED"}>
                                    <button className="primary-button" disabled={actionLoading} onClick={() => handleMockPayment("success")} type="button">
                                        Mock 승인
                                    </button>
                                    <button className="secondary-button" disabled={actionLoading} onClick={() => handleMockPayment("fail")} type="button">
                                        Mock 실패
                                    </button>
                                </div>
                            </div>
                        )}
                    </aside>
                </section>
            </main>

            {paymentExpiredMessage && (
                <div className="ticket-modal-overlay" role="presentation">
                    <div aria-modal="true" className="ticket-modal" role="dialog">
                        <h2>결제 시간이 만료되었습니다</h2>
                        <p>{paymentExpiredMessage}</p>
                        <button className="primary-button ticket-modal-button" onClick={() => void closePaymentExpiredModal()} type="button">
                            확인
                        </button>
                    </div>
                </div>
            )}

            {conflictMessage && (
                <div className="ticket-modal-overlay" role="presentation">
                    <div aria-modal="true" className="ticket-modal" role="dialog">
                        <h2>예약할 수 없는 좌석입니다</h2>
                        <p>{conflictMessage}</p>
                        <button className="primary-button ticket-modal-button" onClick={() => void closeConflictModal()} type="button">
                            확인
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
