import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase client for server-side
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Proxy para a API do Mercado Pago (se necessário)
  app.use('/api/mp', createProxyMiddleware({
    target: 'https://api.mercadopago.com',
    changeOrigin: true,
    pathRewrite: { '^/api/mp': '' },
  }));

  // Middleware para carregar configurações da Evolution API
  app.use('/api/evolution', async (req, res, next) => {
    try {
      const { data } = await supabase.from('app_settings').select('*');
      const dbUrl = data?.find(s => s.key === 'evolution_api_url')?.value;
      const dbKey = data?.find(s => s.key === 'evolution_api_key')?.value;
      
      // Armazena no objeto request para o proxy usar
      (req as any).evolutionConfig = {
        url: dbUrl || process.env.VITE_EVOLUTION_API_URL || 'https://evolution.iss.tec.br',
        key: dbKey || process.env.VITE_EVOLUTION_API_KEY || ''
      };
      next();
    } catch (err) {
      console.error('Erro ao carregar configurações da Evolution:', err);
      next();
    }
  });

  // Proxy para a API Evolution
  app.use('/api/evolution', createProxyMiddleware({
    router: (req) => {
      return (req as any).evolutionConfig?.url;
    },
    changeOrigin: true,
    pathRewrite: { '^/api/evolution': '' },
    onProxyReq: (proxyReq, req) => {
      const config = (req as any).evolutionConfig;
      if (config && !req.headers['apikey']) {
        proxyReq.setHeader('apikey', config.key);
      }
    },
  }));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
