# @virtualdisplay-io/client

The core Virtual Display client library for integrating interactive 3D models into any web application, shop or CMS.
Easily control which parts of your model are shown based on user selections—no vendor lock-in, no complex integration.

## Features

- 🔸 Show/hide 3D meshes, variants, or materials from product options
- 🔸 Send and sync model state between your UI and the 3D viewer
- 🔸 Works seamlessly with the Virtual Display iframe/server setup
- 🔸 Framework-agnostic (works with any frontend: plain JS, React, Vue, etc.)

## Installation

For npm users, install the package with:
```bash
npm install @virtualdisplay-io/client
```

For pnpm users, install the package with:
```bash
pnpm add @virtualdisplay-io/client
```

## Basic usage
```typescript
import { VirtualDisplayClient, State } from '@virtualdisplay-io/client';

// Define product state (attributes reflect your product options)
const state = {
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

// Initialize the client and send state
const client = new VirtualDisplayClient('#virtual-display-iframe');
client.sendClientState(state);
```

- The selector (#virtual-display-iframe) can be any iframe where the Virtual Display server is loaded.
- Identifiers must match the mesh, variant, or material codes used in your 3D model.

## Demos & examples
•	See [/examples/basic/](../examples/basic) for the simplest setup.
•	See [/examples/advanced/](../examples/basic) for a full product configurator demo.

For more integration patterns, see the root [README.md](../README.md) or [virtualdisplay.io](https://www.virtualdisplay.io).
