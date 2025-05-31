import { VirtualDisplayClient } from '../../../core/src';

new VirtualDisplayClient('#virtual-display');

function updateStatus(message: string): void {
  const statusElement = document.getElementById('status');
  if (statusElement) {
    statusElement.textContent = message;
  }
}

window.addEventListener('load', () => {
  try {
    updateStatus('Initializing...');

    const iframe = document.getElementById(
      'virtual-display'
    ) as HTMLIFrameElement;

    if (!iframe || !iframe.contentWindow) {
      throw new Error('Iframe not found or not ready');
    }

    updateStatus('Iframe found! Displaying model.');
  } catch (error) {
    console.error('Initialization error:', error);
    updateStatus('Initialization failed');
  }
});
