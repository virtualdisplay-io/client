/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, ClientLogger } from '../../src/utils/logger';

describe('ClientLogger', () => {
  let consoleSpy: {
    debug: ReturnType<typeof vi.spyOn>;
    info: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when logging at different levels', () => {
    it('should log debug messages with [Client] prefix', () => {
      logger.debug('Test debug message', { key: 'value' });

      expect(consoleSpy.debug).toHaveBeenCalledWith(
        '[Client] Test debug message',
        { key: 'value' }
      );
    });

    it('should log info messages with [Client] prefix', () => {
      logger.info('Test info message', 'extra', 'args');

      expect(consoleSpy.info).toHaveBeenCalledWith(
        '[Client] Test info message',
        'extra',
        'args'
      );
    });

    it('should log warn messages with [Client] prefix', () => {
      logger.warn('Test warning message');

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '[Client] Test warning message'
      );
    });

    it('should log error messages with [Client] prefix', () => {
      logger.error('Test error message', new Error('Test error'));

      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[Client] Test error message',
        new Error('Test error')
      );
    });
  });

  describe('when creating new logger instances', () => {
    it('should create independent logger instances', () => {
      const logger1 = new ClientLogger();
      const logger2 = new ClientLogger();

      logger1.info('Logger 1 message');
      logger2.info('Logger 2 message');

      expect(consoleSpy.info).toHaveBeenCalledTimes(2);
      expect(consoleSpy.info).toHaveBeenNthCalledWith(
        1,
        '[Client] Logger 1 message'
      );
      expect(consoleSpy.info).toHaveBeenNthCalledWith(
        2,
        '[Client] Logger 2 message'
      );
    });

    it('should use singleton logger instance', async () => {
      const { logger: importedLogger } = await import('../../src/utils/logger');

      expect(importedLogger).toBe(logger);
    });
  });

  describe('when logging with no additional arguments', () => {
    it('should handle messages without extra arguments', () => {
      logger.info('Simple message');

      expect(consoleSpy.info).toHaveBeenCalledWith('[Client] Simple message');
    });
  });

  describe('when logging with multiple arguments', () => {
    it('should pass through all arguments to console methods', () => {
      const obj = { id: 123, name: 'test' };
      const arr = [1, 2, 3];

      logger.debug('Complex log', obj, arr, 'string', 42, true);

      expect(consoleSpy.debug).toHaveBeenCalledWith(
        '[Client] Complex log',
        obj,
        arr,
        'string',
        42,
        true
      );
    });
  });
});
