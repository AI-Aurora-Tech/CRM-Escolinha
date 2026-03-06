import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Proxy para a API do Mercado Pago (se necessário)
  app.use('/api/mp', createProxyMiddleware({
    target: 'https://api.mercadopago.com',
    changeOrigin: true,
    pathRewrite: { '^/api/mp': '' },
  }));

  // Proxy para a API Evolution
  app.use('/api/evolution', createProxyMiddleware({
    target: process.env.VITE_EVOLUTION_API_URL || 'https://evolution.iss.tec.br',
    changeOrigin: true,
    pathRewrite: { '^/api/evolution': '' },
    onProxyReq: (proxyReq) => {
      proxyReq.setHeader('apikey', process.env.VITE_EVOLUTION_API_KEY || '');
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
