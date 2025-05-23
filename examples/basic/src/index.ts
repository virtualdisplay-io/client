import { VirtualDisplayClient, State } from '@virtual-display/client';

const client = new VirtualDisplayClient('#virtual-display');
const state: State = {
  attributes: [
    {
      name: 'Color',
      values: [
        { value: 'Red', identifiers: ['color-red'], isSelected: true },
        { value: 'Blue', identifiers: ['color-blue'], isSelected: false },
      ],
    },
    {
      name: 'Size',
      values: [
        { value: 'Small', identifiers: ['small'], isSelected: false },
        { value: 'Large', identifiers: ['large'], isSelected: true },
      ],
    },
  ],
};
client.sendClientState(state);

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
  } catch (error) {
    console.error('Initialization error:', error);
    updateStatus('Initialization failed');
  }
});
