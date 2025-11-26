import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export default function MainLayout() {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Header />
            <main
                style={{
                    flex: 1,
                    padding: "1.5rem",
                }}
            >
                <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
                    <Outlet />
                </div>
            </main>
            <Footer />
        </div>
    );
}
