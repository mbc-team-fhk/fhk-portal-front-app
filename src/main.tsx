import { BrowserRouter } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import App from './App'

const basePath = import.meta.env.VITE_BASE_PATH || '/'
// "/"면 basename 안 주는 게 자연스러움
const basename = basePath === '/' ? undefined : basePath.replace(/\/$/, '')

ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter basename={basename}>
        <App />
    </BrowserRouter>
)
