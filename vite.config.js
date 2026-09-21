import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Keep the optional 3D engine cached separately from the changing game.
        manualChunks(id) {
          if (id.includes('/node_modules/three/')) return 'traffic-three'
        },
      },
    },
  },
  define: {
    __VERCEL_ENV__: JSON.stringify(process.env.VERCEL_ENV || ''),
  },
})
