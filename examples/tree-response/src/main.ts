import { VirtualDisplayClient } from '../../../core/src';

const client = new VirtualDisplayClient('#virtual-display-iframe');

document
  .getElementById('requestTreeBtn')!
  .addEventListener('click', async () => {
    const response = await client.requestModelTree('http://localhost:4003/');
    document.getElementById('output')!.textContent = JSON.stringify(
      response,
      null,
      2
    );
  });
