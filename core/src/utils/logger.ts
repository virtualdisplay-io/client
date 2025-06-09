/**
 * Logger utility for Virtual Display Client using @virtualdisplay-io/logger package
 */

import { Logger } from '@virtualdisplay-io/logger';

// Create logger instance with [Client] prefix
export const logger = new Logger({ prefix: '[Client]' });

// Re-export types for compatibility
export type { ILogger as Logger } from '@virtualdisplay-io/logger';
export { Logger as ClientLogger } from '@virtualdisplay-io/logger';
