import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // listen on all interfaces (LAN 10.10.1.220 + Tailscale 100.64.0.1)
    port: 5175,      // 5173/5174 are used by nigranx-client / geo-frontend
  },
})
