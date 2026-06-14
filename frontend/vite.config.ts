import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../', '');
  return {
    envDir: '../',
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '^/(api/.*|generate-portfolio(?:/.*)?|generate-resume(?:/.*)?|update-portfolio(?:/.*)?|generate-summary(?:/.*)?)': {
          target: env.VITE_API_PROXY || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    plugins: [react()],
    build: {
      emptyOutDir: true,
      chunkSizeWarningLimit: 1000, 
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
                if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler') || id.includes('object-assign')) return 'vendor_react';
                if (id.includes('react-router-dom') || id.includes('react-router')) return 'vendor_router';
                if (id.includes('framer-motion')) return 'vendor_framer-motion';
                if (id.includes('lucide-react') || id.includes('react-icons')) return 'vendor_icons';
                if (id.includes('@heroui')) return 'vendor_heroui';
                if (id.includes('html2pdf.js') || id.includes('html2canvas') || id.includes('jspdf')) return 'vendor_pdf';
                if (id.includes('pdfjs-dist')) return 'vendor_pdfjs';
                if (id.includes('react-markdown') || id.includes('remark-gfm') || id.includes('rehype-raw')) return 'vendor_markdown';
                if (id.includes('lottie-react')) return 'vendor_lottie';
                if (id.includes('qrcode')) return 'vendor_qrcode';
                if (id.includes('react-syntax-highlighter')) return 'vendor_syntax';
                if (id.includes('react-helmet-async')) return 'vendor_helmet';
            }

            // Keep react ecosystem together to avoid circular chunk deps
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/') ||
              id.includes('node_modules/use-sync-external-store/')
            ) return 'vendor_react';
            if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router')) return 'vendor_router';
            if (id.includes('node_modules/framer-motion')) return 'vendor_framer-motion';
            if (id.includes('node_modules/lucide-react') || id.includes('node_modules/react-icons')) return 'vendor_icons';
            if (id.includes('node_modules/@heroui')) return 'vendor_heroui';
            if (id.includes('node_modules/html2pdf.js') || id.includes('node_modules/html2canvas') || id.includes('node_modules/jspdf')) return 'vendor_pdf';
            if (id.includes('node_modules/pdfjs-dist')) return 'vendor_pdfjs';
            if (id.includes('node_modules/react-markdown') || id.includes('node_modules/remark-gfm') || id.includes('node_modules/rehype-raw')) return 'vendor_markdown';
            if (id.includes('node_modules/lottie-react')) return 'vendor_lottie';
            if (id.includes('node_modules/qrcode')) return 'vendor_qrcode';
            if (id.includes('node_modules/react-syntax-highlighter')) return 'vendor_syntax';
            if (id.includes('node_modules/react-helmet-async')) return 'vendor_helmet';
            if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) return 'vendor_three';
            if (id.includes('node_modules/@google/genai')) return 'vendor_genai';

            // Let Rollup split remaining deps — a catch-all vendor_misc caused
            // circular chunk warnings (vendor_misc <-> vendor_react) and TDZ errors in prod.
            return undefined;
          }
        }
      }
    },
    define: {
      'process.env.API_KEY': JSON.stringify(''),
      'process.env.GEMINI_API_KEY': JSON.stringify(''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
