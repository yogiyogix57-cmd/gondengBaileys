
import 'dotenv/config';

const config = {
  botName: process.env.BOT_NAME || 'GondengBaileys',

  ownerNumber: process.env.OWNER_NUMBER || '',

  pairingNumber: process.env.PAIRING_NUMBER || '',

  newsletterJid: process.env.NEWSLETTER_JID || '',

  authDir: process.env.AUTH_DIR || './auth_info',

  printQRInTerminal: false,

  loggerLevel: process.env.LOG_LEVEL || 'silent',

  reconnectDelay: Number(process.env.RECONNECT_DELAY || 3000),

  maxReconnectAttempts: Number(
    process.env.MAX_RECONNECT_ATTEMPTS || 10
  )
};

export default config;
