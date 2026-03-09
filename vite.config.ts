import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    build: {
      target: 'es2020',
      outDir: 'dist',
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY),
      'import.meta.env.VITE_EVOLUTION_API_URL': JSON.stringify(env.VITE_EVOLUTION_API_URL),
      'import.meta.env.VITE_EVOLUTION_API_KEY': JSON.stringify(env.VITE_EVOLUTION_API_KEY),
      'import.meta.env.VITE_EVOLUTION_INSTANCE_NAME': JSON.stringify(env.VITE_EVOLUTION_INSTANCE_NAME),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
  };
});
