import { useState } from "react";

type HealthResult = {
    url: string;
    ok: boolean;
    status: number;
    bodyText: string;
    tookMs: number;
    at: string;
};

// /api/** 라우팅 -> BFF
// BFF 에서는 해당 url 을 받으면
//  -> http://서비스명(fhk-ticketing-member-service):8080/endpoint 로 요청
const SERVICES = [
    { key: "security", name: "fhk-security-server", url: "/api/security/actuator/health" },

    { key: "member", name: "fhk-ticketing-member-service", url: "/api/ticketing-member/actuator/health" },
    { key: "movie", name: "fhk-ticketing-movie-service", url: "/api/ticketing-movie/actuator/health" },
    { key: "reservation", name: "fhk-ticketing-reservation-service", url: "/api/ticketing-reservation/actuator/health" },
    { key: "payment", name: "fhk-ticketing-payment-service", url: "/api/ticketing-payment/actuator/health" },
    { key: "ticket", name: "fhk-ticketing-ticket-service", url: "/api/ticketing-ticket/actuator/health" },
] as const;

async function fetchHealth(url: string): Promise<HealthResult> {
    const started = performance.now();
    try {
        const res = await fetch(url, {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
        });

        const tookMs = Math.round(performance.now() - started);

        // actuator는 json이지만, 에러/프록시 문제면 html/text 올 수 있어서 text로 받아두고 출력
        const text = await res.text();

        return {
            url,
            ok: res.ok,
            status: res.status,
            bodyText: text,
            tookMs,
            at: new Date().toISOString(),
        };
    } catch (e: unknown) {
        const tookMs = Math.round(performance.now() - started);
        return {
            url,
            ok: false,
            status: 0,
            bodyText: e instanceof Error ? e.message : String(e),
            tookMs,
            at: new Date().toISOString(),
        };
    }
}

export default function PingHealthPage() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Record<string, HealthResult | null>>(
        () => Object.fromEntries(SERVICES.map((s) => [s.key, null]))
    );

    const pingAll = async () => {
        setLoading(true);
        try {
            // 동시에 호출
            const settled = await Promise.all(
                SERVICES.map(async (s) => [s.key, await fetchHealth(s.url)] as const)
            );
            setResults((prev) => ({ ...prev, ...Object.fromEntries(settled) }));
        } finally {
            setLoading(false);
        }
    };

    const pingOne = async (key: string, url: string) => {
        setLoading(true);
        try {
            const r = await fetchHealth(url);
            setResults((prev) => ({ ...prev, [key]: r }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "1.25rem", maxWidth: 980, margin: "0 auto" }}>
            <h2 style={{ marginBottom: "0.75rem" }}>Cluster Health Ping</h2>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                <button
                    onClick={pingAll}
                    disabled={loading}
                    style={{
                        padding: "0.6rem 0.9rem",
                        borderRadius: 8,
                        border: "1px solid #222",
                        background: "#222",
                        color: "#fff",
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? "Pinging..." : "Ping All"}
                </button>

                <button
                    onClick={() => setResults(Object.fromEntries(SERVICES.map((s) => [s.key, null])))}
                    disabled={loading}
                    style={{
                        padding: "0.6rem 0.9rem",
                        borderRadius: 8,
                        border: "1px solid #ccc",
                        background: "#fff",
                        color: "#222",
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    Clear
                </button>
            </div>

            <div style={{ display: "grid", gap: "0.75rem" }}>
                {SERVICES.map((s) => {
                    const r = results[s.key];
                    const badgeBg = !r ? "#eee" : r.ok ? "#16a34a" : "#dc2626";

                    return (
                        <div
                            key={s.key}
                            style={{
                                border: "1px solid #e5e7eb",
                                borderRadius: 12,
                                padding: "0.9rem",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{s.name}</div>
                                    <div style={{ fontSize: 12, color: "#555" }}>{s.url}</div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                      style={{
                          fontSize: 12,
                          color: "#fff",
                          background: badgeBg,
                          padding: "0.25rem 0.5rem",
                          borderRadius: 999,
                          minWidth: 72,
                          textAlign: "center",
                      }}
                  >
                    {!r ? "N/A" : r.ok ? "OK" : "FAIL"}
                  </span>

                                    <button
                                        onClick={() => pingOne(s.key, s.url)}
                                        disabled={loading}
                                        style={{
                                            padding: "0.45rem 0.7rem",
                                            borderRadius: 8,
                                            border: "1px solid #ccc",
                                            background: "#fff",
                                            cursor: loading ? "not-allowed" : "pointer",
                                        }}
                                    >
                                        Ping
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginTop: "0.75rem", fontSize: 13, color: "#111" }}>
                                {!r ? (
                                    <div style={{ color: "#666" }}>No result</div>
                                ) : (
                                    <>
                                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8, color: "#333" }}>
                                            <div>
                                                <b>Status</b>: {r.status || "-"}
                                            </div>
                                            <div>
                                                <b>Took</b>: {r.tookMs}ms
                                            </div>
                                            <div>
                                                <b>At</b>: {r.at}
                                            </div>
                                        </div>

                                        <pre
                                            style={{
                                                margin: 0,
                                                padding: "0.75rem",
                                                background: "#0b1020",
                                                color: "#e5e7eb",
                                                borderRadius: 10,
                                                overflowX: "auto",
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word",
                                            }}
                                        >
                      {r.bodyText}
                    </pre>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
