export function Footer() {
    return (
        <footer
            style={{
                borderTop: "1px solid #e5e5e5",
                padding: "2rem 1.5rem",
                fontSize: "0.8rem",
                background: "#1E1E1E",
                color: "#E9E9E9",
            }}
        >
            <div style={{ maxWidth: "1080px", margin: "0 auto", textAlign: "center" }}>
                Copyright {new Date().getFullYear()}. all rights reserved by FHK Team.
            </div>
        </footer>
    );
}
