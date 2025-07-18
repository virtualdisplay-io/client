import type { ClientOptions } from './client-options';
import { IframeBuilder } from './iframe-builder';
import { VirtualdisplayError } from './virtualdisplay-error';
import { AttributeSelector } from '../attributes/attribute-selector';
import { AttributeService } from '../attributes/attribute-service';
import type { MappingConfiguration } from '../attributes/mapping-types';
import { Camera } from '../camera';
import { EventBus } from '../events/event-bus';
import { EVENT_NAMES } from '../events/event-names';
import { MessageHandler } from '../messaging/message-handler';
import type { ModelNode } from '../nodes/node';
import { NodeSelector } from '../nodes/node-selector';
import { StateService } from '../nodes/state-service';
import { Snapshot } from '../snapshot';
import { VirtualdisplayViewerService } from '../ui/virtualdisplay-viewer-service';
import { logger, enableDebugMode } from '../utils/logger';

/**
 * Main Virtualdisplay Client
 * Provides the public API for 3D product visualization
 */
export class VirtualdisplayClient {
  private readonly eventBus: EventBus;

  private readonly attributeService: AttributeService;

  private readonly stateService: StateService;

  private readonly messageHandler: MessageHandler;

  private readonly viewerService: VirtualdisplayViewerService;

  private readonly cameraApi: Camera;

  private readonly snapshotApi: Snapshot;

  private readonly options: ClientOptions;

  private iframe: HTMLIFrameElement | undefined;

  constructor(options: ClientOptions) {
    this.options = options;
    this.eventBus = new EventBus();
    this.attributeService = new AttributeService(this.eventBus);
    this.stateService = new StateService(this.eventBus);
    this.messageHandler = new MessageHandler(this.eventBus);
    this.viewerService = new VirtualdisplayViewerService(this.eventBus);
    this.cameraApi = new Camera(this.eventBus);
    this.snapshotApi = new Snapshot(this.eventBus);

    this.initializeLogging();
    this.createAndConnectIframe();
    this.setupInitialConfig();
  }

  private initializeLogging(): void {
    if (this.options.debug === true) {
      enableDebugMode();
    }

    logger.info('Initializing Virtualdisplay client', {
      model: this.options.model,
      debug: this.options.debug,
      language: this.options.language,
    });
  }

  private createAndConnectIframe(): void {
    logger.debug('Creating iframe for Virtualdisplay viewer');

    const iframeBuilder = new IframeBuilder(this.options, this.eventBus);

    this.iframe = iframeBuilder.create();
    logger.debug('Iframe created, setting up messaging');

    this.messageHandler.setIframe(this.iframe);
  }

  private setupInitialConfig(): void {
    // Send initial config after iframe is ready
    this.eventBus.once(EVENT_NAMES.IFRAME_READY, () => {
      this.viewerService.sendInitialConfig(this.options);
    });
  }

  /**
   * Load attribute mapping configuration
   * @throws {VirtualdisplayError} When mapping configuration is invalid
   */
  public setMapping(config: MappingConfiguration): void {
    logger.debug('Setting attribute mapping configuration', {
      attributeCount: config.attributes.length,
    });
    this.attributeService.loadMapping(config);
  }

  /**
   * Get attribute selector for fluent API
   * @throws {VirtualdisplayError} When no mapping is configured or attribute not found
   */
  public getAttribute(name: string): AttributeSelector {
    if (!this.attributeService.initialized) {
      throw VirtualdisplayError.noMapping();
    }

    const attribute = this.attributeService.getAttribute(name);
    if (attribute === undefined) {
      throw VirtualdisplayError.attributeNotFound(name);
    }

    logger.debug(`Getting attribute selector for: ${name}`);
    return new AttributeSelector(this.attributeService, name);
  }

  /**
   * Get node selector for direct node control
   * @param nodeId The node ID to control
   * @returns NodeSelector if node exists, undefined otherwise
   */
  public getNodeSelector(nodeId: string): NodeSelector | undefined {
    const node = this.stateService.getNode(nodeId);
    if (node === undefined) {
      logger.warn(`Node not found: ${nodeId}`);
      return undefined;
    }

    return new NodeSelector(this.eventBus, this.stateService, nodeId);
  }

  public getNode(id: string): ModelNode | undefined {
    return this.stateService.getNode(id);
  }

  public getNodes(): ModelNode[] {
    return this.stateService.getAllNodes();
  }

  /**
   * Check if the client has received initial state and is ready
   */
  public get isReady(): boolean {
    return this.stateService.isReady;
  }

  /**
   * Register a callback to be called when the client is ready
   * If already ready, the callback is called immediately
   */
  public onReady(callback: () => void): void {
    if (this.stateService.isReady) {
      callback();
      return;
    }

    this.eventBus.once(EVENT_NAMES.INITIAL_STATE_RECEIVED, callback);
  }

  /**
   * Get the viewer service for UI configuration
   */
  public get viewer(): VirtualdisplayViewerService {
    return this.viewerService;
  }

  /**
   * Get the camera control API
   */
  public get camera(): Camera {
    return this.cameraApi;
  }

  /**
   * Get the snapshot API for taking screenshots
   */
  public get snapshot(): Snapshot {
    return this.snapshotApi;
  }

  public destroy(): void {
    logger.info('Destroying Virtualdisplay client');

    this.attributeService.clear();
    this.stateService.clear();
    this.messageHandler.destroy();

    // Remove iframe
    if (this.iframe?.parentElement !== null && this.iframe?.parentElement !== undefined) {
      this.iframe.parentElement.removeChild(this.iframe);
    }
    this.iframe = undefined;

    logger.debug('Virtualdisplay client destroyed');
  }
}
