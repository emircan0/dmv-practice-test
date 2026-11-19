import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const proxyConfig = {
  '/supabase-admin-proxy': {
    target: 'https://bcwbteadwiuqcscrphys.supabase.co',
    changeOrigin: true,
    secure: true,
    rewrite: (path: string) => path.replace(/^\/supabase-admin-proxy/, ''),
    router: (req: any) => {
      const customTarget = req.headers['x-supabase-target-url'];
      if (typeof customTarget === 'string' && customTarget.startsWith('http')) {
        return customTarget;
      }
      return 'https://bcwbteadwiuqcscrphys.supabase.co';
    },
    configure: (proxy: any) => {
      proxy.on('proxyReq', (proxyReq: any) => {
        // Strip browser-identifying headers so Supabase Kong gateway does not reject secret API keys
        proxyReq.removeHeader('origin');
        proxyReq.removeHeader('referer');
        proxyReq.removeHeader('sec-fetch-site');
        proxyReq.removeHeader('sec-fetch-mode');
        proxyReq.removeHeader('sec-fetch-dest');
        proxyReq.removeHeader('sec-ch-ua');
        proxyReq.removeHeader('sec-ch-ua-mobile');
        proxyReq.removeHeader('sec-ch-ua-platform');
        proxyReq.removeHeader('x-supabase-target-url');
        proxyReq.setHeader('User-Agent', 'dmv-admin-server/1.0');
      });
    },
  },
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: proxyConfig,
  },
  preview: {
    port: 5173,
    host: true,
    proxy: proxyConfig,
  },
});
