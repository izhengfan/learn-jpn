import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'learn-jpn'
const base = process.env.GITHUB_ACTIONS === 'true' ? `/${repositoryName}/` : '/'

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    watch: {
      ignored: ['**/*.tmpdir/**', '**/.*.tmpdir/**', '**/.tmpdir/**'],
    },
  },
})
