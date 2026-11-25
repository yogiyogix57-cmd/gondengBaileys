
export function getMessageType(message) {
  if (!message || typeof message !== 'object') {
    return 'unknown';
  }

  const ignored = [
    'messageContextInfo',
    'senderKeyDistributionMessage'
  ];

  return Object.keys(message).find(
    key => !ignored.includes(key)
  ) || 'unknown';
}

export function unwrapMessage(message) {
  let current = message;

  while (current && typeof current === 'object') {
    const wrapped =
      current.ephemeralMessage?.message ||
      current.viewOnceMessage?.message ||
      current.viewOnceMessageV2?.message ||
      current.viewOnceMessageV2Extension?.message ||
      current.documentWithCaptionMessage?.message;

    if (!wrapped) break;
    current = wrapped;
  }

  return current;
}

export function getMessageText(message) {
  const content = unwrapMessage(message);

  return (
    content?.conversation ||
    content?.extendedTextMessage?.text ||
    content?.imageMessage?.caption ||
    content?.videoMessage?.caption ||
    content?.documentMessage?.caption ||
    content?.buttonsResponseMessage?.selectedDisplayText ||
    content?.listResponseMessage?.title ||
    content?.templateButtonReplyMessage?.selectedDisplayText ||
    ''
  );
}

export function getMessageInfo(message) {
  const content = unwrapMessage(message?.message);

  return {
    type: getMessageType(content),
    text: getMessageText(content),
    isGroup: Boolean(message?.key?.remoteJid?.endsWith('@g.us')),
    fromMe: Boolean(message?.key?.fromMe),
    remoteJid: message?.key?.remoteJid || '',
    participant: message?.key?.participant || ''
  };
}
