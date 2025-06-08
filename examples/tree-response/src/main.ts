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
      requestBtn.setAttribute('aria-busy', 'true');
      requestBtn.textContent = 'Loading...';
      
      // Update output with live region announcement
      output.setAttribute('aria-live', 'polite');
      output.setAttribute('aria-busy', 'true');
      output.textContent = 'Requesting model tree...';

      // Request the model tree
      const response = await client.requestModelTree();
      
      // Display the response
      output.setAttribute('aria-busy', 'false');
      output.textContent = JSON.stringify(response, null, 2);
    } catch (error) {
      // Handle errors with accessible announcement
      output.setAttribute('aria-busy', 'false');
      output.setAttribute('role', 'alert');
      output.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
      console.error('Failed to request model tree:', error);
    } finally {
      // Re-enable button
      requestBtn.disabled = false;
      requestBtn.setAttribute('aria-busy', 'false');
      requestBtn.textContent = 'Request Model Tree';
    }
  });
});