import { Logger } from '@virtualdisplay-io/logger';

export const logger = Logger.getInstance().child({
  prefix: 'Client',
  level: 'warn', // Show warnings and errors by default
});

export function enableDebugMode(): void {
  logger.setLevel('debug');
  logger.debug('Debug mode enabled');
}

export function isDebugMode(): boolean {
  return logger.getLevel() === 'debug';
}
