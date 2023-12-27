import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [],
	server: { host: '0.0.0.0', port: 8000 },
	clearScreen: false,
	optimizeDeps: {
        include: [
            '@apollo/client/core',
            '@apollo/client/cache'
        ]
    }
})
