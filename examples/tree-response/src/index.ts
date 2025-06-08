import { VirtualDisplayClient, VirtualDisplayClientOptions } from '../../../core/src';

// Configuration for Virtual Display
const options: VirtualDisplayClientOptions = {
  parent: '#virtual-display-placeholder',
  license: 'demo',
  model: 'demo',
  style: { background: '#f9fafb' },
  title: 'Tree Response Demo Model',
  classNames: 'w-full h-full min-h-[280px]',
};

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
  // Build the Virtual Display iframe
  const client = await VirtualDisplayClient.builder(options);
  
  const requestBtn = document.getElementById('requestTreeBtn') as HTMLButtonElement;
  const output = document.getElementById('output') as HTMLPreElement;

  if (!requestBtn || !output) {
    console.error('Required DOM elements not found');
    return;
  }

  requestBtn.addEventListener('click', async () => {
    try {
      // Disable button and show loading state
      requestBtn.disabled = true;
      requestBtn.textContent = 'Loading...';
      output.textContent = 'Requesting model tree...';

      // Request the model tree
      const response = await client.requestModelTree();
      
      // Display the response
      output.textContent = JSON.stringify(response, null, 2);
    } catch (error) {
      // Handle errors
      output.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
      console.error('Failed to request model tree:', error);
    } finally {
      // Re-enable button
      requestBtn.disabled = false;
      requestBtn.textContent = 'Request Model Tree';
    }
  });
});