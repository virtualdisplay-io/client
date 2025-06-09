/**
 * Logger utility for Virtual Display Client using @virtualdisplay-io/logger package
 */

import { Logger } from '@virtualdisplay-io/logger';

// Check if we're running in a test environment
const isTestEnvironment =
  (typeof process !== 'undefined' &&
    (process.env.NODE_ENV === 'test' ||
      process.env.VITEST === 'true' ||
      process.env.JEST_WORKER_ID)) ||
  false;

// Allow force enabling logs in tests with DEBUG_TESTS=true
const forceLogsInTests =
  typeof process !== 'undefined' && process.env.DEBUG_TESTS === 'true';

/**
 * Configured logger instance for Virtual Display Client
 * Uses '[Client]' prefix to distinguish from other Virtual Display components
 * Automatically muted during test runs to keep output clean
 * Can be enabled in tests by setting DEBUG_TESTS=true
 */
export const logger = new Logger({
  prefix: '[Client]',
  enabled: forceLogsInTests || !isTestEnvironment, // Disable logging in test environment unless forced
  colors: true,
  timestamp: false,
});