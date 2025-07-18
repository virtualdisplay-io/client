export interface PhotoData {
  readonly filename: string;
  readonly data: string;
}

/**
 * Represents a photo being captured
 * Pure domain object that manages callbacks for when the photo is developed
 */
export class Photo {
  private readonly callbacks: Set<(photo: PhotoData) => void> = new Set();

  private developed = false;

  private photoData: PhotoData | null = null;

  constructor(
    private readonly filename: string,
  ) {}

  /**
   * Register a callback for when the photo is developed
   * If the photo is already developed, the callback is called immediately
   *
   * @param callback Function to call with photo data
   * @returns This Photo instance for chaining
   */
  public onDeveloped(callback: (photo: PhotoData) => void): this {
    if (this.developed && this.photoData !== null) {
      // Photo already developed, call immediately
      callback(this.photoData);
      return this;
    }
    // Store callback for later
    this.callbacks.add(callback);
    return this;
  }

  /**
   * Get the filename for this photo
   */
  public getFilename(): string {
    return this.filename;
  }

  /**
   * Mark the photo as developed and notify all callbacks
   * This method is called by the SnapshotMessageHandler when the photo data arrives
   */
  public develop(photoData: PhotoData): void {
    if (this.developed) {
      return;
    }

    this.photoData = photoData;
    this.developed = true;

    // Call all registered callbacks
    this.callbacks.forEach(callback => {
      callback(this.photoData!);
    });

    // Clear callbacks after calling
    this.callbacks.clear();
  }
}
