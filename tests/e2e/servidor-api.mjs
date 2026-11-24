// Sobe a API real do backend com banco SQLite temporário, descartado ao encerrar.
import { mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Pasta fixa e recriada a cada execução: o encerramento do Playwright mata o processo sem rodar limpeza.
const pasta = join(tmpdir(), 'galeria-e2e');
rmSync(pasta, { recursive: true, force: true });
mkdirSync(pasta, { recursive: true });
process.env.DB_PATH = join(pasta, 'galeria.sqlite');

function limpar() {
  try { rmSync(pasta, { recursive: true, force: true }); } catch { /* o sistema apaga a pasta temporária depois */ }
}
process.on('exit', limpar);
for (const sinal of ['SIGINT', 'SIGTERM']) process.on(sinal, () => process.exit(0));

await import('../../backend/src/server.js');
