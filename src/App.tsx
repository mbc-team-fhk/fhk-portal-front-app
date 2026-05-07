import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import TeamPage from "./pages/TeamPage";
import LoginPage from "./pages/LoginPage";
import LoginCallbackPage from "./pages/LoginCallbackPage";
import PingHealthPage from "./pages/PingHealthPage";
import AboutPage from "./pages/AboutPage";
import AboutNotionPage from "./pages/AboutNotionPage";
import ArchitecturePage from "./pages/ArchitecturePage";
import FeaturesPage from "./pages/FeaturesPage";
import MyPage from "./pages/MyPage";
import TicketReservationsPage from "./pages/TicketReservationsPage";
import ScrollManager from "./components/common/ScrollManager";

function App() {
    return (
        <>
            <ScrollManager />
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/about-notion" element={<AboutNotionPage />} />
                    <Route path="/features" element={<FeaturesPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/projects/ticket-reservations" element={<TicketReservationsPage />} />
                    <Route path="/contact" element={<TeamPage />} />
                    <Route path="/myPage" element={<MyPage />} />
                    <Route path="/my" element={<Navigate to="/myPage" replace />} />
                    <Route path="/me" element={<Navigate to="/myPage" replace />} />
                    <Route path="/architecture" element={<ArchitecturePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/auth/callback" element={<Navigate to="/login" replace />} />
                    <Route path="/redirect/:provider" element={<LoginCallbackPage />} />
                    <Route path="/pingtest" element={<PingHealthPage />} />
                </Route>
            </Routes>
        </>
    );
}

export default App;
