/*
This file is used to configure the Vite build process.
It is used to specify the plugins and environment variables.

Documentation: https://vite.dev/config/
*/


// Import the Vite plugin for React
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// Define the Vite configuration
export default defineConfig({
  plugins: [react()],
})
