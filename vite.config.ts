// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Jenkins 에서 넘겨줄 예정 (staging: "/qa/", prod: "/")
const basePath = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  plugins: [react()],
  base: basePath,
})