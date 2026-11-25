
import config from './config.js';
import logger from './logger.js';

export async function followConfiguredNewsletter(socket) {
  const jid = config.newsletterJid;

  if (!jid) {
    logger.info('Newsletter belum dikonfigurasi.');
    return false;
  }

  if (!jid.endsWith('@newsletter')) {
    logger.warn('NEWSLETTER_JID tidak valid. Harus berakhiran @newsletter.');
    return false;
  }

  if (typeof socket.newsletterFollow !== 'function') {
    logger.warn('API newsletterFollow tidak tersedia pada versi Baileys ini.');
    return false;
  }

  try {
    await socket.newsletterFollow(jid);
    logger.info({ jid }, 'Berhasil meminta follow newsletter.');
    return true;
  } catch (error) {
    logger.error({ error, jid }, 'Gagal follow newsletter.');
    return false;
  }
}
