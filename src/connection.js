import {
  default as makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';

import config from './config.js';
import logger from './logger.js';
import { handleMessages } from './handlers/message-handler.js';
import { followConfiguredNewsletter } from './newsletter.js';

let socket;
let reconnectAttempts = 0;
let reconnectTimer;
let pairingRequested = false;
let stopping = false;

export async function startConnection() {
  if (stopping) return;

  try {
    const { state, saveCreds } =
      await useMultiFileAuthState(config.authDir);

    const { version } = await fetchLatestBaileysVersion();

    socket = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: config.printQRInTerminal,
      logger,
      browser: ['GondengBaileys', 'Chrome', '1.0.0'],
      markOnlineOnConnect: false,
      syncFullHistory: false
    });

    socket.ev.on('creds.update', saveCreds);

    socket.ev.on('messages.upsert', async (upsert) => {
      await handleMessages(upsert, socket);
    });

    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'connecting') {
        logger.info('Menghubungkan ke WhatsApp...');
      }

      if (
        connection === 'connecting' &&
        !state.creds.registered &&
        config.pairingNumber &&
        !pairingRequested
      ) {
        pairingRequested = true;

        try {
          const number = config.pairingNumber.replace(/\D/g, '');
          const code = await socket.requestPairingCode(number);

          logger.info(`PAIRING CODE: ${code}`);
        } catch (error) {
          pairingRequested = false;
          logger.error({ error }, 'Gagal meminta pairing code.');
        }
      }

      if (connection === 'open') {
        reconnectAttempts = 0;
        pairingRequested = false;

        logger.info('WhatsApp berhasil terhubung.');

        await followConfiguredNewsletter(socket);
      }

      if (connection === 'close') {
        const statusCode =
          lastDisconnect?.error?.output?.statusCode;

        const loggedOut =
          statusCode === DisconnectReason.loggedOut;

        logger.warn({ statusCode }, 'Koneksi WhatsApp terputus.');

        if (loggedOut) {
          logger.error('Sesi logout. Hapus sesi hanya jika ingin pairing ulang.');
          return;
        }

        scheduleReconnect();
      }
    });

    return socket;
  } catch (error) {
    logger.error({ error }, 'Gagal memulai koneksi.');
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (stopping || reconnectTimer) return;

  if (reconnectAttempts >= config.maxReconnectAttempts) {
    logger.error('Batas reconnect tercapai.');
    return;
  }

  reconnectAttempts++;

  logger.info({
    attempt: reconnectAttempts,
    delay: config.reconnectDelay
  }, 'Menjadwalkan reconnect...');

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = undefined;
    await startConnection();
  }, config.reconnectDelay);
}

export async function stopConnection() {
  stopping = true;

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = undefined;
  }

  try {
    socket?.end(undefined);
  } catch (error) {
    logger.error({ error }, 'Gagal menutup koneksi.');
  }

  logger.info('Bot dihentikan.');
}
