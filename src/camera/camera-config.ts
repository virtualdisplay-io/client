/**
 * Camera configuration options
 */
export interface CameraConfig {
  readonly initialRotate?: number; // Degrees for horizontal rotation
  readonly initialTilt?: number; // Degrees for vertical tilt
  readonly initialZoom?: number; // Percentage (100 = default framing)
  readonly minZoom?: number; // Minimum zoom percentage
  readonly maxZoom?: number; // Maximum zoom percentage
  readonly minTilt?: number; // Minimum tilt in degrees
  readonly maxTilt?: number; // Maximum tilt in degrees
}
