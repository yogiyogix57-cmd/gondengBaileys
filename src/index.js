
import logger from './logger.js';
import { startConnection, stopConnection } from './connection.js';

let shuttingDown = false;

async function main() {
  logger.info('Starting GondengBaileys...');
  await startConnection();
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info({ signal }, 'Menghentikan GondengBaileys...');

  await stopConnection();
  process.exit(0);
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (error) => {
  logger.error({ error }, 'Unhandled promise rejection.');
});

process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught exception.');
  shutdown('uncaughtException');
});

main().catch((error) => {
  logger.fatal({ error }, 'Gagal menjalankan bot.');
  process.exit(1);
});
