// App.tsx
import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import TeamPage from "./pages/TeamPage";
import ArchitecturePage from "./pages/ArchitecturePage";
import LoginPage from "./pages/LoginPage";
import LoginCallbackPage from "./pages/LoginCallbackPage";

function App() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/contact" element={<TeamPage />} />
                <Route path="/architecture" element={<ArchitecturePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/auth/callback" element={<LoginCallbackPage />} />
            </Route>
        </Routes>
    );
}

export default App;
