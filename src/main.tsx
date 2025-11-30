// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext' // 경로는 실제 위치에 맞게

// Vite 에서 주입되는 환경변수
const basePath = import.meta.env.VITE_BASE_PATH || '/'

// "/qa/" -> "/qa" 로, "/" 는 basename 안 줌
const basename =
    basePath === '/' ? undefined : basePath.replace(/\/$/, '')

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter basename={basename}>
                <App />
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>
)
