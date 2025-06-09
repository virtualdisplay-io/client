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

## Response Types

The client can subscribe to responses from the Virtual Display server:

### OBJECT_TREE Response
Returns the complete 3D model structure when requested:
```typescript
import { VirtualDisplayResponseType } from '@virtualdisplay-io/client';

client.onResponseSubscriber(
  VirtualDisplayResponseType.OBJECT_TREE,
  (response) => {
    console.log('Object tree:', response.context.objectTree);
  }
);
```

### CLIENT_STATE Response (v2.3.0+)
Automatically sent after any state change, providing the complete object tree with visibility information:
```typescript
client.onResponseSubscriber(
  VirtualDisplayResponseType.CLIENT_STATE,
  (response) => {
    const { objectTree } = response.context;
    console.log('Visible meshes:', objectTree.tree);
    console.log('Variants with visibility:', objectTree.variants);
    // Example: variants = [{ name: 'red-variant', visible: true }, { name: 'blue-variant', visible: false }]
  }
);
```

The CLIENT_STATE response is sent automatically when:
- `sendClientState()` is called
- A variant is changed
- Object visibility is modified
- Any other state mutation occurs

This allows your application to stay perfectly synchronized with the 3D model's actual state.

## Demos & examples
•	See [/examples/simple-model-integration/](../examples/simple-model-integration) for the simplest setup.
•	See [/examples/variable-products/](../examples/variable-products) for a full product configurator demo.

For more integration patterns, see the root [README.md](../README.md) or [virtualdisplay.io](https://www.virtualdisplay.io).
