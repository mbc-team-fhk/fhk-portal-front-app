import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Jenkins에서 VITE_BASE_PATH 를 넣어줄 예정 (예: "/qa/" 또는 "/")
const basePath = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  plugins: [react()],
  base: basePath,   // ← 여기만 환경에 따라 달라짐
})