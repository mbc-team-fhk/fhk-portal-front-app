import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/1_HOME/HomePage.tsx";
import ProjectsPage from "./pages/4_PROJECTS/ProjectsPage.tsx";
import TeamPage from "./pages/5_CONTACT/TeamPage.tsx";
import LoginPage from "./pages/0_USER/LoginPage.tsx";
import LoginCallbackPage from "./pages/0_USER/LoginCallbackPage.tsx";
import PingHealthPage from "./pages/0_SYSTEM/PingHealthPage.tsx";
import AboutPage from "./pages/deprecated/AboutPage.tsx";
import AboutNotionPage from "./pages/2_ABOUT/AboutNotionPage.tsx";
import ArchitecturePage from "./pages/deprecated/ArchitecturePage.tsx";
import FeaturesPage from "./pages/3_FEATURES/FeaturesPage.tsx";
import MyPage from "./pages/0_USER/MyPage.tsx";
import TicketReservationsPage from "./pages/4_PROJECTS/TicketReservationsPage.tsx";
import ScrollManager from "./components/common/ScrollManager";
import DragGuard from "./components/common/DragGuard";

function App() {
    return (
        <>
            <ScrollManager />
            <DragGuard />
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
