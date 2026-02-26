import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Proxy para a API do Mercado Pago (se necessário)
app.use('/api/mp', createProxyMiddleware({
  target: 'https://api.mercadopago.com',
  changeOrigin: true,
  pathRewrite: { '^/api/mp': '' },
}));

// Proxy para a API Evolution
// As variáveis de ambiente serão lidas pelo ambiente serverless da Vercel
app.use('/api/evolution', createProxyMiddleware({
  target: process.env.VITE_EVOLUTION_API_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/evolution': '' },
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader('apikey', process.env.VITE_EVOLUTION_API_KEY || '');
  },
}));

// Exporta o app para a Vercel usar como uma função serverless
export default app;
