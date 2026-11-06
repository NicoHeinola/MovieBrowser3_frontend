import { fileURLToPath, URL } from 'node:url';
import Vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

import packageJson from './package.json' with { type: 'json' };

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      Vue({
        template: { transformAssetUrls },
      }),
      // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
      Vuetify({
        autoImport: true,
        // Vitest cannot load Vuetify's Sass imports, and tests do not need styles.
        styles: mode === 'test' ? 'none' : { configFile: 'src/styles/settings.scss' },
      }),
    ],
    define: {
      'process.env': {},
      // The update notice compares this with the newest GitHub release. APP_VERSION_OVERRIDE (dev only) fakes an older
      // version, so the notice can be seen without a real release.
      __APP_VERSION__: JSON.stringify(env.APP_VERSION_OVERRIDE || packageJson.version),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('src', import.meta.url)),
      },
      extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
    },
    server: {
      port: env.APP_PORT ? Number(env.APP_PORT) : undefined,
    },
    preview: {
      port: env.APP_PORT ? Number(env.APP_PORT) : undefined,
      // Production builds call the relative /api/v1, which the real web server proxies to the backend. Do the same
      // here so the built app works locally. PREVIEW_API_TARGET overrides the dev backend address.
      proxy: { '/api': env.PREVIEW_API_TARGET || 'http://localhost:8765' },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      server: {
        deps: {
          inline: ['vuetify'],
        },
      },
    },
  };
});
