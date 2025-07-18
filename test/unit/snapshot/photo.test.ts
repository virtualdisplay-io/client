import { describe, it, expect, vi } from 'vitest';

import { Photo, type PhotoData } from '../../../src/snapshot/photo';

describe('Photo - basic functionality', () => {
  describe('constructor', () => {
    it('should create a photo instance', () => {
      const photo = new Photo('test.png');

      expect(photo.getFilename()).toBe('test.png');
    });
  });

  describe('onDeveloped callbacks', () => {
    it('should call callback when photo is developed', () => {
      const photo = new Photo('test.png');
      const callback = vi.fn();

      photo.onDeveloped(callback);

      // Develop the photo
      const photoData: PhotoData = {
        filename: 'test.png',
        data: 'data:image/png;base64,abc123',
      };
      photo.develop(photoData);

      expect(callback).toHaveBeenCalledWith(photoData);
    });

    it('should support method chaining', () => {
      const photo = new Photo('test.png');
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const result = photo
        .onDeveloped(callback1)
        .onDeveloped(callback2);

      expect(result).toBe(photo);
    });

    it('should call multiple callbacks when photo is developed', () => {
      const photo = new Photo('test.png');
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      photo.onDeveloped(callback1);
      photo.onDeveloped(callback2);

      const photoData: PhotoData = {
        filename: 'test.png',
        data: 'data:image/png;base64,abc123',
      };
      photo.develop(photoData);

      expect(callback1).toHaveBeenCalledOnce();
      expect(callback2).toHaveBeenCalledOnce();
    });
  });
});

describe('Photo - late callbacks', () => {
  it('should call callback immediately if photo already developed', () => {
    const photo = new Photo('test.png');

    // Develop the photo first
    const photoData: PhotoData = {
      filename: 'test.png',
      data: 'data:image/png;base64,abc123',
    };
    photo.develop(photoData);

    // Now add callback
    const callback = vi.fn();
    photo.onDeveloped(callback);

    expect(callback).toHaveBeenCalledWith(photoData);
  });
});

describe('Photo - edge cases', () => {
  it('should not call callbacks multiple times', () => {
    const photo = new Photo('test.png');
    const callback = vi.fn();

    photo.onDeveloped(callback);

    const photoData: PhotoData = {
      filename: 'test.png',
      data: 'data:image/png;base64,abc123',
    };

    // Develop the photo twice
    photo.develop(photoData);
    photo.develop(photoData);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should clear callbacks after developing', () => {
    const photo = new Photo('test.png');
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    photo.onDeveloped(callback1);

    // Develop the photo
    const photoData: PhotoData = {
      filename: 'test.png',
      data: 'data:image/png;base64,abc123',
    };
    photo.develop(photoData);

    // Add another callback after developing
    photo.onDeveloped(callback2);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });
});
