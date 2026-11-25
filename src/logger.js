
import pino from 'pino';
import config from './config.js';

const logger = pino({
  level: config.loggerLevel,
  transport:
    config.loggerLevel === 'debug' ||
    config.loggerLevel === 'info'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname'
          }
        }
      : undefined
});

export default logger;
