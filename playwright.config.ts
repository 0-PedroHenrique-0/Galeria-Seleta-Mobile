import { defineConfig } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_SENHA, API_URL, AUTH_SECRET_TESTE } from './tests/e2e/apoio';

const SEGUNDO = 1000;

export default defineConfig({
  testDir: 'tests/e2e',
  // Os testes compartilham a mesma API e o mesmo banco temporário; cada um cria os próprios dados.
  workers: 1,
  timeout: 60 * SEGUNDO,
  expect: { timeout: 10 * SEGUNDO },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    viewport: { width: 390, height: 844 },
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: [
    {
      // API real, com banco SQLite temporário da execução (nunca backend/data).
      command: 'node tests/e2e/servidor-api.mjs',
      url: `${API_URL}/api/products`,
      reuseExistingServer: false,
      timeout: 30 * SEGUNDO,
      env: {
        PORT: '3334',
        AUTH_SECRET: AUTH_SECRET_TESTE,
        ADMIN_EMAIL,
        ADMIN_PASSWORD: ADMIN_SENHA,
      },
    },
    {
      // Build web estática. A URL da API entra no bundle, por isso a variável vale já no build.
      command: 'npm run build:web && npx serve dist -l 4173',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: false,
      timeout: 300 * SEGUNDO,
      env: { EXPO_PUBLIC_API_URL: API_URL },
    },
  ],
});
