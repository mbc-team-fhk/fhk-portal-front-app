import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import TeamPage from "./pages/TeamPage";
import LoginPage from "./pages/LoginPage";
import LoginCallbackPage from "./pages/LoginCallbackPage";
import PingHealthPage from "./pages/PingHealthPage";
import AboutPage from "./pages/AboutPage";
import FeaturesPage from "./pages/FeaturesPage";
import MePage from "./pages/MePage";
import ScrollManager from "./components/common/ScrollManager";

function App() {
    return (
        <>
            <ScrollManager />
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/features" element={<FeaturesPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/contact" element={<TeamPage />} />
                    <Route path="/me" element={<MePage />} />
                    <Route path="/architecture" element={<Navigate to="/about#architecture" replace />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/auth/callback" element={<LoginCallbackPage />} />
                    <Route path="/pingtest" element={<PingHealthPage />} />
                </Route>
            </Routes>
        </>
    );
}

export default App;
