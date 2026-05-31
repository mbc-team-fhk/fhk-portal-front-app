import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent, type ReactNode, type WheelEvent } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";
import type {
    PaymentResponse,
    ReservationResponse,
    ScreeningSummary,
    SeatStatusItem,
} from "../../types/ticketReservation.ts";
import { TicketReservationApiError, ticketReservationApi } from "../../utils/ticketReservationApi.ts";

const ticketHeroStyle = {
    "--ticket-hero-image": "url('/images/main_banner1.PNG')",
} as CSSProperties;

type SeatMapView = {
    scale: number;
    x: number;
    y: number;
};

type ViewerPointer = {
    x: number;
    y: number;
};

type ScreeningChangeWarning = {
    screeningId: number;
    title: string;
    message: string;
};

const SEAT_MAP_MOBILE_QUERY = "(max-width: 720px)";
const SEAT_MAP_STAGE_WIDTH = 638;
const SEAT_MAP_STAGE_HEIGHT = 400;
const MIN_SEAT_MAP_SCALE = 1;
const MAX_SEAT_MAP_SCALE = 3.2;
const SEAT_MAP_ZOOM_STEP = 0.4;
const SEAT_MAP_DRAG_THRESHOLD = 5;

const initialSeatMapView: SeatMapView = {
    scale: MIN_SEAT_MAP_SCALE,
    x: 0,
    y: 0,
};

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

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function getDistance(first: ViewerPointer, second: ViewerPointer) {
    return Math.hypot(first.x - second.x, first.y - second.y);
}

function isMobileSeatMapViewer() {
    return typeof window !== "undefined" && window.matchMedia(SEAT_MAP_MOBILE_QUERY).matches;
}

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

function TicketModalPortal({ children }: { children: ReactNode }) {
    if (typeof document === "undefined") {
        return children;
    }

    return createPortal(children, document.body);
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
    const [, setMessage] = useState<string | null>(null);
    const [conflictMessage, setConflictMessage] = useState<string | null>(null);
    const [paymentExpiredMessage, setPaymentExpiredMessage] = useState<string | null>(null);
    const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
    const [reserveConfirmOpen, setReserveConfirmOpen] = useState(false);
    const [mockPaymentOpen, setMockPaymentOpen] = useState(false);
    const [screeningChangeWarning, setScreeningChangeWarning] = useState<ScreeningChangeWarning | null>(null);
    const [pendingSeatChange, setPendingSeatChange] = useState<SeatStatusItem | null>(null);
    const [seatMapView, setSeatMapView] = useState<SeatMapView>(initialSeatMapView);
    const [seatMapFitScale, setSeatMapFitScale] = useState(1);
    const seatMapViewRef = useRef<SeatMapView>(initialSeatMapView);
    const seatMapViewerRef = useRef<HTMLDivElement | null>(null);
    const activeSeatMapPointersRef = useRef(new Map<number, ViewerPointer>());
    const seatMapPanGestureRef = useRef<{ startX: number; startY: number; x: number; y: number } | null>(null);
    const seatMapPinchGestureRef = useRef<{ distance: number; scale: number } | null>(null);
    const seatPointerCandidateRef = useRef<{ pointerId: number; seatId: number; startX: number; startY: number } | null>(null);
    const suppressSeatClickRef = useRef(false);
    const skipNextSeatClickRef = useRef(false);

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
    const hasBookingProgress = selectedSeatIds.length > 0 || reservation !== null || payment !== null;
    const screeningDescription = selectedScreening
        ? `${selectedScreening.cinemaName} ${selectedScreening.screenRoomName} · ${formatDate(selectedScreening.startsAt)}`
        : "-";
    const summaryAnimationKey = `${selectedSeatIds.join("-")}-${totalAmount}`;

    const resetSeatMapInteraction = () => {
        activeSeatMapPointersRef.current.clear();
        seatMapPanGestureRef.current = null;
        seatMapPinchGestureRef.current = null;
        seatPointerCandidateRef.current = null;
        suppressSeatClickRef.current = false;
    };

    const clampSeatMapView = (nextView: SeatMapView): SeatMapView => {
        const scale = clamp(nextView.scale, MIN_SEAT_MAP_SCALE, MAX_SEAT_MAP_SCALE);
        const viewer = seatMapViewerRef.current;

        if (!viewer || scale <= MIN_SEAT_MAP_SCALE) {
            return initialSeatMapView;
        }

        const maxX = (viewer.clientWidth * (scale - 1)) / 2;
        const maxY = (viewer.clientHeight * (scale - 1)) / 2;

        return {
            scale,
            x: clamp(nextView.x, -maxX, maxX),
            y: clamp(nextView.y, -maxY, maxY),
        };
    };

    const updateSeatMapView = (nextView: SeatMapView | ((currentView: SeatMapView) => SeatMapView)) => {
        if (!isMobileSeatMapViewer()) {
            seatMapViewRef.current = initialSeatMapView;
            setSeatMapView(initialSeatMapView);
            return;
        }

        setSeatMapView((currentView) => {
            const resolvedView = typeof nextView === "function" ? nextView(currentView) : nextView;
            const clampedView = clampSeatMapView(resolvedView);
            seatMapViewRef.current = clampedView;
            return clampedView;
        });
    };

    const resetSeatMapView = () => {
        resetSeatMapInteraction();
        seatMapViewRef.current = initialSeatMapView;
        setSeatMapView(initialSeatMapView);
    };

    const zoomSeatMap = (amount: number) => {
        updateSeatMapView((currentView) => ({
            ...currentView,
            scale: currentView.scale + amount,
        }));
    };

    const syncSeatMapFitScale = () => {
        const viewer = seatMapViewerRef.current;
        const nextFitScale = isMobileSeatMapViewer() && viewer
            ? Math.min(1, viewer.clientWidth / SEAT_MAP_STAGE_WIDTH)
            : 1;

        setSeatMapFitScale(nextFitScale);
    };

    const handleSeatMapPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (!isMobileSeatMapViewer() || (event.pointerType === "mouse" && event.button !== 0)) {
            return;
        }

        suppressSeatClickRef.current = false;
        const seatButton = event.target instanceof Element
            ? event.target.closest<HTMLButtonElement>(".seat-button")
            : null;
        const seatId = seatButton?.dataset.seatId ? Number(seatButton.dataset.seatId) : null;

        if (seatId) {
            seatPointerCandidateRef.current = {
                pointerId: event.pointerId,
                seatId,
                startX: event.clientX,
                startY: event.clientY,
            };
        }

        event.currentTarget.setPointerCapture(event.pointerId);
        activeSeatMapPointersRef.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
        });

        const activePointers = Array.from(activeSeatMapPointersRef.current.values());
        const currentView = seatMapViewRef.current;

        if (activePointers.length === 1) {
            seatMapPanGestureRef.current = {
                startX: event.clientX,
                startY: event.clientY,
                x: currentView.x,
                y: currentView.y,
            };
            seatMapPinchGestureRef.current = null;
            return;
        }

        if (activePointers.length === 2) {
            suppressSeatClickRef.current = true;
            seatMapPanGestureRef.current = null;
            seatMapPinchGestureRef.current = {
                distance: getDistance(activePointers[0], activePointers[1]),
                scale: currentView.scale,
            };
        }
    };

    const handleSeatMapPointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (!isMobileSeatMapViewer() || !activeSeatMapPointersRef.current.has(event.pointerId)) {
            return;
        }

        const seatPointerCandidate = seatPointerCandidateRef.current;
        if (
            seatPointerCandidate?.pointerId === event.pointerId
            && Math.hypot(event.clientX - seatPointerCandidate.startX, event.clientY - seatPointerCandidate.startY) > SEAT_MAP_DRAG_THRESHOLD
        ) {
            suppressSeatClickRef.current = true;
        }

        activeSeatMapPointersRef.current.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY,
        });

        const activePointers = Array.from(activeSeatMapPointersRef.current.values());

        if (activePointers.length >= 2 && seatMapPinchGestureRef.current) {
            event.preventDefault();
            suppressSeatClickRef.current = true;
            const nextDistance = getDistance(activePointers[0], activePointers[1]);
            const nextScale = seatMapPinchGestureRef.current.scale * (nextDistance / seatMapPinchGestureRef.current.distance);

            updateSeatMapView((currentView) => ({
                ...currentView,
                scale: nextScale,
            }));
            return;
        }

        const currentView = seatMapViewRef.current;
        if (currentView.scale <= MIN_SEAT_MAP_SCALE || !seatMapPanGestureRef.current) {
            return;
        }

        const deltaX = event.clientX - seatMapPanGestureRef.current.startX;
        const deltaY = event.clientY - seatMapPanGestureRef.current.startY;

        if (Math.hypot(deltaX, deltaY) > SEAT_MAP_DRAG_THRESHOLD) {
            suppressSeatClickRef.current = true;
        }

        event.preventDefault();
        updateSeatMapView({
            scale: currentView.scale,
            x: seatMapPanGestureRef.current.x + deltaX,
            y: seatMapPanGestureRef.current.y + deltaY,
        });
    };

    const handleSeatMapPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
        if (!isMobileSeatMapViewer()) {
            return;
        }

        const seatPointerCandidate = seatPointerCandidateRef.current;
        if (seatPointerCandidate?.pointerId === event.pointerId) {
            const moved = Math.hypot(event.clientX - seatPointerCandidate.startX, event.clientY - seatPointerCandidate.startY) > SEAT_MAP_DRAG_THRESHOLD;
            const targetSeat = seats.find((seat) => seat.seatId === seatPointerCandidate.seatId);

            if (!moved && !suppressSeatClickRef.current && targetSeat) {
                skipNextSeatClickRef.current = true;
                toggleSeat(targetSeat);
            }

            seatPointerCandidateRef.current = null;
        }

        activeSeatMapPointersRef.current.delete(event.pointerId);

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        const activePointers = Array.from(activeSeatMapPointersRef.current.values());
        const currentView = seatMapViewRef.current;

        if (activePointers.length === 1) {
            seatMapPanGestureRef.current = {
                startX: activePointers[0].x,
                startY: activePointers[0].y,
                x: currentView.x,
                y: currentView.y,
            };
            seatMapPinchGestureRef.current = null;
            return;
        }

        seatMapPanGestureRef.current = null;
        seatMapPinchGestureRef.current = null;
    };

    const handleSeatMapWheel = (event: WheelEvent<HTMLDivElement>) => {
        if (!isMobileSeatMapViewer() || (!event.ctrlKey && !event.metaKey)) {
            return;
        }

        event.preventDefault();
        updateSeatMapView((currentView) => ({
            ...currentView,
            scale: currentView.scale - event.deltaY * 0.002,
        }));
    };

    const handleSeatMapDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
        if (!isMobileSeatMapViewer() || event.target instanceof Element && event.target.closest(".seat-button")) {
            return;
        }

        if (seatMapViewRef.current.scale > MIN_SEAT_MAP_SCALE) {
            resetSeatMapView();
            return;
        }

        updateSeatMapView({
            scale: 2,
            x: 0,
            y: 0,
        });
    };

    const handleSeatButtonClick = (seat: SeatStatusItem) => {
        if (suppressSeatClickRef.current) {
            suppressSeatClickRef.current = false;
            return;
        }

        if (skipNextSeatClickRef.current) {
            skipNextSeatClickRef.current = false;
            return;
        }

        toggleSeat(seat);
    };

    const refreshSeats = async (showLoading = true) => {
        if (!selectedScreeningId) {
            return;
        }

        const loadingStartedAt = Date.now();
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
                const remainingLoadingTime = 500 - (Date.now() - loadingStartedAt);

                if (remainingLoadingTime > 0) {
                    await new Promise((resolve) => window.setTimeout(resolve, remainingLoadingTime));
                }

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
            resetSeatMapView();
            return;
        }

        setSelectedSeatIds([]);
        setReservation(null);
        setPayment(null);
        resetSeatMapView();
        refreshSeats();
    }, [selectedScreeningId]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const mediaQuery = window.matchMedia(SEAT_MAP_MOBILE_QUERY);
        const resizeObserver = typeof ResizeObserver === "undefined"
            ? null
            : new ResizeObserver(() => {
                syncSeatMapFitScale();
                updateSeatMapView((currentView) => currentView);
            });

        if (seatMapViewerRef.current) {
            resizeObserver?.observe(seatMapViewerRef.current);
        }

        const handleViewportChange = () => {
            syncSeatMapFitScale();

            if (!mediaQuery.matches) {
                resetSeatMapView();
                return;
            }

            updateSeatMapView((currentView) => currentView);
        };

        handleViewportChange();
        mediaQuery.addEventListener("change", handleViewportChange);
        window.addEventListener("resize", handleViewportChange);

        return () => {
            mediaQuery.removeEventListener("change", handleViewportChange);
            window.removeEventListener("resize", handleViewportChange);
            resizeObserver?.disconnect();
        };
    }, []);

    const seatMapCombinedScale = seatMapFitScale * seatMapView.scale;
    const seatMapBaseX = (SEAT_MAP_STAGE_WIDTH * seatMapFitScale * (1 - seatMapView.scale)) / 2;
    const seatMapBaseY = (SEAT_MAP_STAGE_HEIGHT * seatMapFitScale * (1 - seatMapView.scale)) / 2;

    const clearBookingFlow = () => {
        setSelectedSeatIds([]);
        setReservation(null);
        setPayment(null);
        setReserveConfirmOpen(false);
        setMockPaymentOpen(false);
    };

    const applySeatToggle = (seat: SeatStatusItem) => {
        if (seat.status !== "AVAILABLE") {
            return;
        }

        setSelectedSeatIds((current) =>
            current.includes(seat.seatId)
                ? current.filter((seatId) => seatId !== seat.seatId)
                : [...current, seat.seatId],
        );
    };

    const toggleSeat = (seat: SeatStatusItem) => {
        if (seat.status !== "AVAILABLE") {
            return;
        }

        if (reservation || payment) {
            setPendingSeatChange(seat);
            return;
        }

        applySeatToggle(seat);
    };

    const confirmSeatChange = () => {
        if (!pendingSeatChange) {
            return;
        }

        setReservation(null);
        setPayment(null);
        setMockPaymentOpen(false);
        setReserveConfirmOpen(false);
        setSelectedSeatIds([pendingSeatChange.seatId]);
        setPendingSeatChange(null);
    };

    const handleScreeningSelect = (screeningId: number) => {
        if (screeningId === selectedScreeningId) {
            return;
        }

        if (!hasBookingProgress) {
            setSelectedScreeningId(screeningId);
            return;
        }

        setScreeningChangeWarning({
            screeningId,
            title: reservation || payment ? "진행 중인 예약을 초기화할까요?" : "선택한 예매 정보를 초기화할까요?",
            message: reservation || payment
                ? "상영을 변경하면 진행 중인 예약 정보가 사라집니다. 점유된 예약 좌석은 5분 뒤 자동 해제될 수 있습니다."
                : "상영을 변경하면 진행 중인 예매 선택 정보가 초기화됩니다.",
        });
    };

    const confirmScreeningChange = () => {
        if (!screeningChangeWarning) {
            return;
        }

        clearBookingFlow();
        setSelectedScreeningId(screeningChangeWarning.screeningId);
        setScreeningChangeWarning(null);
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
            setReserveConfirmOpen(false);
            setMessage("예약이 생성되었습니다. 결제 요청을 진행할 수 있습니다.");
            await refreshSeats();
        } catch (error) {
            if (error instanceof TicketReservationApiError && error.status === 409) {
                setReserveConfirmOpen(false);
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
            setMockPaymentOpen(true);
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
            setMockPaymentOpen(false);
            setMessage(mode === "success" ? "Mock 결제가 승인되었습니다." : "Mock 결제가 실패 처리되었습니다.");
        } catch (error) {
            if (isPaymentExpiredError(error)) {
                setMockPaymentOpen(false);
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
            clearBookingFlow();
            await refreshSeats();
            setMessage("데모 좌석 데이터가 초기화되었습니다.");
        } catch (error) {
            setMessage(getTicketErrorMessage(error, "데모 데이터 초기화에 실패했습니다."));
        } finally {
            setResetConfirmOpen(false);
            setActionLoading(false);
        }
    };

    return (
        <div className="ticket-page">
            <section className="ticket-hero" style={ticketHeroStyle}>
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
                <div className="ticket-demo-toolbar">
                    <button
                        className="secondary-button ticket-demo-reset-button"
                        type="button"
                        onClick={() => setResetConfirmOpen(true)}
                        disabled={actionLoading || seatsLoading}
                    >
                        데모 초기화
                    </button>
                </div>
                <section className="ticket-section">
                    <div className="ticket-section-heading">
                        <div>
                            <h2>상영 목록</h2>
                            <p>데모 카탈로그에서 예매할 상영을 선택하세요.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="ticket-empty">상영 정보를 불러오는 중입니다.</div>
                    ) : (
                        <div className="screening-grid">
                            {screenings.map((screening) => (
                                <button
                                    className={`screening-card${screening.screeningId === selectedScreeningId ? " is-active" : ""}`}
                                    key={screening.screeningId}
                                    onClick={() => handleScreeningSelect(screening.screeningId)}
                                    type="button"
                                >
                                    <span className="screening-card-cinema">{screening.cinemaName}</span>
                                    <div className="screening-card-main">
                                        <strong>{screening.movieTitle}</strong>
                                        <small>
                                            <span>{screening.screenRoomName}</span>
                                            <span>{formatDate(screening.startsAt)}</span>
                                        </small>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                <section className="ticket-grid-layout ticket-flow-region" key={selectedScreeningId ?? "empty-screening"}>
                    <div className="ticket-section ticket-seat-section">
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

                        <div className="seat-map-frame">
                            <div
                                aria-label="좌석표"
                                className={`seat-map-viewer${seatMapView.scale > MIN_SEAT_MAP_SCALE ? " is-zoomed" : ""}`}
                                onDoubleClick={handleSeatMapDoubleClick}
                                onPointerCancel={handleSeatMapPointerEnd}
                                onPointerDown={handleSeatMapPointerDown}
                                onPointerMove={handleSeatMapPointerMove}
                                onPointerUp={handleSeatMapPointerEnd}
                                onWheel={handleSeatMapWheel}
                                ref={seatMapViewerRef}
                                style={{
                                    "--seat-map-frame-height": `${SEAT_MAP_STAGE_HEIGHT * seatMapFitScale}px`,
                                } as CSSProperties}
                                tabIndex={0}
                            >
                                <div
                                    className="seat-map-stage"
                                    style={{
                                        transform: `translate3d(${seatMapBaseX + seatMapView.x}px, ${seatMapBaseY + seatMapView.y}px, 0) scale(${seatMapCombinedScale})`,
                                    }}
                                >
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
                                                                data-seat-id={seat.seatId}
                                                                disabled={seat.status !== "AVAILABLE"}
                                                                key={seat.seatId}
                                                                onClick={() => handleSeatButtonClick(seat)}
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
                                </div>
                                {seatsRefreshing && (
                                    <div className="seat-map-loading-overlay" role="status">
                                        <span className="seat-map-loading-bar" />
                                        <span>좌석 정보를 새로고침 중입니다.</span>
                                    </div>
                                )}
                            </div>
                            <div className="seat-map-zoom-controls" aria-label="좌석표 확대 축소">
                                <button
                                    aria-label="좌석표 축소"
                                    className="seat-map-zoom-button"
                                    disabled={seatMapView.scale <= MIN_SEAT_MAP_SCALE}
                                    onClick={() => zoomSeatMap(-SEAT_MAP_ZOOM_STEP)}
                                    type="button"
                                >
                                    -
                                </button>
                                <button
                                    aria-label="좌석표 전체보기"
                                    className="seat-map-zoom-button"
                                    disabled={seatMapView.scale <= MIN_SEAT_MAP_SCALE}
                                    onClick={resetSeatMapView}
                                    type="button"
                                >
                                    1x
                                </button>
                                <button
                                    aria-label="좌석표 확대"
                                    className="seat-map-zoom-button"
                                    disabled={seatMapView.scale >= MAX_SEAT_MAP_SCALE}
                                    onClick={() => zoomSeatMap(SEAT_MAP_ZOOM_STEP)}
                                    type="button"
                                >
                                    +
                                </button>
                            </div>
                        </div>

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
                        {!reservation ? (
                            <div className="ticket-step-panel">
                                <span className="ticket-step-label">Step 1</span>
                                <h2>결제 정보</h2>
                                {selectedSeats.length === 0 ? (
                                    <div className="ticket-empty compact">선택한 좌석이 없습니다.</div>
                                ) : (
                                    <div className="selected-seat-list">
                                        {selectedSeats.map((seat) => (
                                            <div className="selected-seat-row ticket-list-enter" key={seat.seatId}>
                                                <span>{seat.seatLabel}</span>
                                                <strong>{formatCurrency(seat.price)}</strong>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="summary-total ticket-total-enter" key={summaryAnimationKey}>
                                    <span>합계</span>
                                    <strong>{formatCurrency(totalAmount)}</strong>
                                </div>

                                {!authLoading && !isAuthenticated && (
                                    <div className="login-required">
                                        결제 진행은 로그인이 필요합니다. <Link to="/login">로그인 페이지</Link>
                                    </div>
                                )}

                                <button
                                    className="primary-button ticket-full-button"
                                    disabled={!isAuthenticated || actionLoading || selectedSeatIds.length === 0}
                                    onClick={() => setReserveConfirmOpen(true)}
                                    type="button"
                                >
                                    결제하기
                                </button>
                            </div>
                        ) : (
                            <div className="ticket-step-panel">
                                <span className="ticket-step-label">Step 2</span>
                                <h2>예약 현황</h2>
                                <dl className="ticket-detail-list">
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

                                {reservation.status === "PENDING_PAYMENT" && (
                                    <div className="ticket-payment-method">
                                        <h3>결제 방법 선택</h3>
                                        <button
                                            className="secondary-button ticket-full-button"
                                            disabled={actionLoading || Boolean(payment)}
                                            onClick={handleCreatePayment}
                                            type="button"
                                        >
                                            Mock 네이버페이 결제
                                        </button>
                                        {payment?.status === "REQUESTED" && (
                                            <button className="primary-button ticket-full-button" disabled={actionLoading} onClick={() => setMockPaymentOpen(true)} type="button">
                                                Mock PG 상태 처리
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {payment && reservation && (
                            <div className="ticket-step-panel ticket-payment-history">
                                <span className="ticket-step-label">Step 3</span>
                                <h2>결제 내역</h2>
                                <dl className="ticket-detail-list">
                                    <dt>예약 번호</dt>
                                    <dd>{reservation.reservationNo}</dd>
                                    <dt>상영</dt>
                                    <dd>{screeningDescription}</dd>
                                    <dt>영화</dt>
                                    <dd>{selectedScreening?.movieTitle || "-"}</dd>
                                    <dt>좌석</dt>
                                    <dd>{formatSeatLabels(reservation.seats)}</dd>
                                    <dt>결제 번호</dt>
                                    <dd>{payment.paymentNo}</dd>
                                    <dt>결제 상태</dt>
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
                            </div>
                        )}
                    </aside>
                </section>
            </main>

            {reserveConfirmOpen && selectedScreening && selectedSeats.length > 0 && (
                <TicketModalPortal>
                    <div className="ticket-modal-overlay" role="presentation">
                        <div aria-labelledby="ticket-reserve-title" aria-modal="true" className="ticket-modal" role="alertdialog">
                            <h2 id="ticket-reserve-title">결제를 진행하시겠습니까?</h2>
                            <dl className="ticket-modal-detail-list">
                                <dt>영화관</dt>
                                <dd>{selectedScreening.cinemaName}</dd>
                                <dt>영화</dt>
                                <dd>{selectedScreening.movieTitle}</dd>
                                <dt>상영</dt>
                                <dd>{`${selectedScreening.screenRoomName} · ${formatDate(selectedScreening.startsAt)}`}</dd>
                                <dt>좌석</dt>
                                <dd>{formatSeatLabels(selectedSeats)}</dd>
                                <dt>결제금액</dt>
                                <dd>{formatCurrency(totalAmount)}</dd>
                            </dl>
                            <div className="ticket-modal-actions">
                                <button className="secondary-button" disabled={actionLoading} onClick={() => setReserveConfirmOpen(false)} type="button">
                                    취소
                                </button>
                                <button className="primary-button" disabled={actionLoading} onClick={() => void handleReserve()} type="button">
                                    예약 생성
                                </button>
                            </div>
                        </div>
                    </div>
                </TicketModalPortal>
            )}

            {mockPaymentOpen && payment && (
                <TicketModalPortal>
                    <div className="ticket-modal-overlay" role="presentation">
                        <div aria-labelledby="ticket-mock-payment-title" aria-modal="true" className="ticket-modal" role="alertdialog">
                            <h2 id="ticket-mock-payment-title">Mock PG 결제 프로세스</h2>
                            <p>실제 결제가 아닌 테스트용 Mock PG 흐름입니다. 승인 또는 실패 이벤트를 발생시켜 결제 상태를 갱신할 수 있습니다.</p>
                            <dl className="ticket-modal-detail-list">
                                <dt>결제 번호</dt>
                                <dd>{payment.paymentNo}</dd>
                                <dt>결제금액</dt>
                                <dd>{formatCurrency(payment.amount)}</dd>
                                <dt>상태</dt>
                                <dd>{statusLabels[payment.status] || payment.status}</dd>
                                <dt>요청시간</dt>
                                <dd>{formatDate(payment.requestedAt)}</dd>
                            </dl>
                            <div className="ticket-modal-actions">
                                <button className="secondary-button" disabled={actionLoading} onClick={() => setMockPaymentOpen(false)} type="button">
                                    닫기
                                </button>
                                <button className="secondary-button" disabled={actionLoading} onClick={() => handleMockPayment("fail")} type="button">
                                    결제 실패 발생
                                </button>
                                <button className="primary-button" disabled={actionLoading} onClick={() => handleMockPayment("success")} type="button">
                                    결제 승인 발생
                                </button>
                            </div>
                        </div>
                    </div>
                </TicketModalPortal>
            )}

            {screeningChangeWarning && (
                <TicketModalPortal>
                    <div className="ticket-modal-overlay" role="presentation">
                        <div aria-labelledby="ticket-screening-change-title" aria-modal="true" className="ticket-modal" role="alertdialog">
                            <h2 id="ticket-screening-change-title">{screeningChangeWarning.title}</h2>
                            <p>{screeningChangeWarning.message}</p>
                            <div className="ticket-modal-actions">
                                <button className="secondary-button" disabled={actionLoading} onClick={() => setScreeningChangeWarning(null)} type="button">
                                    취소
                                </button>
                                <button className="primary-button ticket-danger-button" disabled={actionLoading} onClick={confirmScreeningChange} type="button">
                                    변경
                                </button>
                            </div>
                        </div>
                    </div>
                </TicketModalPortal>
            )}

            {pendingSeatChange && (
                <TicketModalPortal>
                    <div className="ticket-modal-overlay" role="presentation">
                        <div aria-labelledby="ticket-seat-change-title" aria-modal="true" className="ticket-modal" role="alertdialog">
                            <h2 id="ticket-seat-change-title">좌석 선택을 변경할까요?</h2>
                            <p>좌석을 변경하면 진행 중인 예약 정보가 사라집니다. 예약 좌석은 5분 뒤 자동 해제될 수 있습니다.</p>
                            <div className="ticket-modal-actions">
                                <button className="secondary-button" disabled={actionLoading} onClick={() => setPendingSeatChange(null)} type="button">
                                    취소
                                </button>
                                <button className="primary-button ticket-danger-button" disabled={actionLoading} onClick={confirmSeatChange} type="button">
                                    변경
                                </button>
                            </div>
                        </div>
                    </div>
                </TicketModalPortal>
            )}

            {paymentExpiredMessage && (
                <TicketModalPortal>
                    <div className="ticket-modal-overlay" role="presentation">
                        <div aria-modal="true" className="ticket-modal" role="dialog">
                            <h2>결제 시간이 만료되었습니다</h2>
                            <p>{paymentExpiredMessage}</p>
                            <button className="primary-button ticket-modal-button" onClick={() => void closePaymentExpiredModal()} type="button">
                                확인
                            </button>
                        </div>
                    </div>
                </TicketModalPortal>
            )}

            {resetConfirmOpen && (
                <TicketModalPortal>
                    <div className="ticket-modal-overlay" role="presentation">
                        <div aria-labelledby="ticket-reset-title" aria-modal="true" className="ticket-modal ticket-reset-modal" role="alertdialog">
                            <div aria-hidden="true" className="ticket-reset-modal-icon" />
                            <h2 id="ticket-reset-title">데모 데이터를 초기화할까요?</h2>
                            <p>상영 좌석 상태와 진행 중인 예약/결제 테스트 흐름이 초기 상태로 되돌아갑니다.</p>
                            <div className="ticket-modal-actions">
                                <button className="secondary-button" disabled={actionLoading} onClick={() => setResetConfirmOpen(false)} type="button">
                                    취소
                                </button>
                                <button className="primary-button ticket-danger-button" disabled={actionLoading} onClick={() => void handleResetDemo()} type="button">
                                    초기화
                                </button>
                            </div>
                        </div>
                    </div>
                </TicketModalPortal>
            )}

            {conflictMessage && (
                <TicketModalPortal>
                    <div className="ticket-modal-overlay" role="presentation">
                        <div aria-modal="true" className="ticket-modal" role="dialog">
                            <h2>예약할 수 없는 좌석입니다</h2>
                            <p>{conflictMessage}</p>
                            <button className="primary-button ticket-modal-button" onClick={() => void closeConflictModal()} type="button">
                                확인
                            </button>
                        </div>
                    </div>
                </TicketModalPortal>
            )}
        </div>
    );
}
