import { describe, it, expect } from 'vitest';

import type { CameraConfig } from '../../../src/camera/camera-config';
import type { ClientOptions } from '../../../src/client/client-options';

// Interface tests
describe('CameraConfig - Interface', () => {
  it('should accept all camera configuration properties', () => {
    const config: CameraConfig = {
      initialRotate: 45,
      initialTilt: 30,
      initialZoom: 150,
      minZoom: 25,
      maxZoom: 400,
      minTilt: -90,
      maxTilt: 90,
    };

    expect(config.initialRotate).toBe(45);
    expect(config.initialTilt).toBe(30);
    expect(config.initialZoom).toBe(150);
    expect(config.minZoom).toBe(25);
    expect(config.maxZoom).toBe(400);
    expect(config.minTilt).toBe(-90);
    expect(config.maxTilt).toBe(90);
  });

  it('should work with partial configuration', () => {
    const config: CameraConfig = {
      initialZoom: 100,
      minZoom: 50,
      maxZoom: 200,
    };

    expect(config.initialZoom).toBe(100);
    expect(config.minZoom).toBe(50);
    expect(config.maxZoom).toBe(200);
    expect(config.initialRotate).toBeUndefined();
    expect(config.initialTilt).toBeUndefined();
  });

  it('should work with empty configuration', () => {
    const config: CameraConfig = {};

    expect(Object.keys(config)).toHaveLength(0);
  });
});

// ClientOptions integration tests
describe('CameraConfig - ClientOptions', () => {
  it('should be included in ClientOptions', () => {
    const options: ClientOptions = {
      parent: '#viewer',
      model: 'test-model',
      license: 'test-license',
      camera: {
        initialZoom: 100,
        minZoom: 25,
        maxZoom: 400,
      },
    };

    expect(options.camera).toBeDefined();
    expect(options.camera?.initialZoom).toBe(100);
    expect(options.camera?.minZoom).toBe(25);
    expect(options.camera?.maxZoom).toBe(400);
  });

  it('should work alongside UI configuration', () => {
    const options: ClientOptions = {
      parent: '#viewer',
      model: 'test-model',
      license: 'test-license',
      camera: {
        initialZoom: 200,
        minZoom: 50,
        maxZoom: 300,
      },
      ui: {
        arEnabled: true,
        fullscreenEnabled: true,
        loadingIndicatorEnabled: true,
      },
    };

    expect(options.camera).toBeDefined();
    expect(options.ui).toBeDefined();
    expect(options.camera?.initialZoom).toBe(200);
    expect(options.ui?.arEnabled).toBe(true);
  });
});

// Validation scenario tests
describe('CameraConfig - Validation', () => {
  it('should handle standard zoom range (25% to 400%)', () => {
    const config: CameraConfig = {
      initialZoom: 100,
      minZoom: 25,
      maxZoom: 400,
    };

    // This represents a 16x zoom range
    const zoomRange = config.maxZoom! / config.minZoom!;
    expect(zoomRange).toBe(16);
  });

  it('should handle custom zoom for large models', () => {
    const config: CameraConfig = {
      initialZoom: 270, // 2.7x zoom for large solar panels
      minZoom: 25,
      maxZoom: 400,
    };

    expect(config.initialZoom).toBeGreaterThan(100);
    expect(config.initialZoom).toBeLessThanOrEqual(config.maxZoom!);
  });

  it('should handle tilt constraints', () => {
    const config: CameraConfig = {
      minTilt: -45, // Look up 45 degrees
      maxTilt: 90, // Look down 90 degrees
    };

    const tiltRange = config.maxTilt! - config.minTilt!;
    expect(tiltRange).toBe(135); // 135 degree range
  });

  it('should handle rotation values', () => {
    const config: CameraConfig = {
      initialRotate: 180, // Start from back view
    };

    expect(config.initialRotate).toBe(180);
  });
});
