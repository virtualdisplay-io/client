import { VirtualDisplayClient } from '../../../core/src';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  const client = new VirtualDisplayClient('#virtual-display-iframe');
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