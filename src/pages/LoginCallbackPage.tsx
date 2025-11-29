export default function LoginCallbackPage() {
    return (
        <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>
                로그인 처리 중...
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#555" }}>
                외부 인증 서버에서 돌아온 응답을 처리하는 페이지입니다. 실제 구현 시
                쿼리 파라미터의 코드/토큰을 BFF 로 전달하여 세션/쿠키를 설정하도록
                구성하면 됩니다.
            </p>
        </div>
    );
}
