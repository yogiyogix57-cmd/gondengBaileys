
import logger from '../logger.js';
import { getMessageInfo } from '../message-utils.js';

export async function handleMessages(upsert, socket) {
  if (!upsert?.messages?.length) return;

  for (const message of upsert.messages) {
    try {
      if (!message?.message) continue;
      if (message.key?.fromMe) continue;

      const info = getMessageInfo(message);

      logger.info({
        sender: info.participant || info.remoteJid,
        type: info.type,
        group: info.isGroup,
        text: info.text
      }, 'Pesan diterima');

      // Tempat menambahkan command handler.
      // Semua tipe pesan yang diterima tetap bisa diproses
      // melalui objek message asli.
    } catch (error) {
      logger.error({ error }, 'Gagal memproses pesan.');
    }
  }
}
