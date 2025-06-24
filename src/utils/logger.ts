import { Logger } from '@virtualdisplay-io/logger';

export const logger = Logger.getInstance().child({
  prefix: 'Client',
  level: 'info', // Default level, can be changed via enableDebugMode
});

export function enableDebugMode(): void {
  logger.setLevel('debug');
  logger.debug('Debug mode enabled');
}

export function isDebugMode(): boolean {
  return logger.getLevel() === 'debug';
}
