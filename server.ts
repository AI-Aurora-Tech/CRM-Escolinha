import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const port = process.env.PORT || 3000;

// Proxy para a API do Mercado Pago (exemplo, se você precisar)
app.use('/api/mp', createProxyMiddleware({
  target: 'https://api.mercadopago.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/mp': '',
  },
}));

// Proxy para a API Evolution
app.use('/api/evolution', createProxyMiddleware({
  target: process.env.VITE_EVOLUTION_API_URL, // Usaremos a variável de ambiente
  changeOrigin: true,
  pathRewrite: {
    '^/api/evolution': '',
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('apikey', process.env.VITE_EVOLUTION_API_KEY || '');
  },
}));

// Servir arquivos estáticos do React em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));

  // Qualquer outra rota (não API) serve o index.html do React
  app.get('*', (req, res) => {
    res.sendFile('dist/index.html', { root: '.' });
  });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
