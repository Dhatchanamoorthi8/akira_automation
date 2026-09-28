import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// Plugin to fix Safari crossorigin caching bug with CSS files
const removeCrossoriginFromCss = () => ({
  name: 'remove-crossorigin-from-css',
  enforce: 'post',
  transformIndexHtml(html) {
    return html.replace(/<link rel="stylesheet" crossorigin(.*?)>/g, '<link rel="stylesheet"$1>');
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    removeCrossoriginFromCss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: {
        safari: (15 << 16),
        ios_saf: (15 << 16)
      }
    }
  },
  build: {
    cssMinify: 'lightningcss',
    chunkSizeWarningLimit: 600,
    modulePreload: {
      resolveDependencies(filename, deps, { hostType }) {
        if (hostType === 'html') {
          return deps.filter(dep => !dep.includes('vendor-supabase') && !dep.includes('vendor-heroui'));
        }
        return deps;
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');
          if (normalizedId.includes('node_modules')) {
            if (normalizedId.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (
              normalizedId.includes('@heroui') ||
              normalizedId.includes('@internationalized') ||
              normalizedId.includes('@react-aria') ||
              normalizedId.includes('@react-stately')
            ) {
              return 'vendor-heroui';
            }
            if (normalizedId.includes('motion')) {
              return 'vendor-motion';
            }
            if (normalizedId.includes('three')) {
              return 'vendor-three';
            }
            if (
              normalizedId.includes('/react/') ||
              normalizedId.includes('/react-dom/') ||
              normalizedId.includes('/react-router/') ||
              normalizedId.includes('/react-router-dom/')
            ) {
              return 'vendor-react-core';
            }
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    watch: {
      ignored: ['**/.agents/**', '**/extracted_ppt_images/**', '**/*.pptx'],
    },
  },
});
