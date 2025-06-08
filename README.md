# Virtual Display Client
[![version](https://img.shields.io/github/package-json/v/virtualdisplay-io/client)](https://github.com/virtualdisplay-io/client)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Virtual Display is a powerful toolkit for embedding interactive 3D product configurators in any webshop, CMS, or web application. Using our secure, managed 3D server, you can visualize products with unlimited options—without worrying about rendering, performance, or model management.

## Features
- ⚡ Seamless 3D integration via iframe with message-based communication
- 🔀 Real-time state synchronization between your UI and the 3D model
- 🛒 Optimized for e-commerce (variants, materials, dynamic meshes)
- 🧩 Framework-agnostic: works with React, Vue, plain JS, etc.
- 🔒 Fully managed backend—no hosting or scaling worries
- 📦 Multiple build formats: ESM, CommonJS, and UMD

## Installation

```bash
npm install @virtualdisplay-io/client
# or
pnpm add @virtualdisplay-io/client
# or
yarn add @virtualdisplay-io/client
```

## Build Outputs

The client library provides multiple build formats for different use cases:

- **ESM**: `virtualdisplay.client.es.js` - Modern ES modules
- **CommonJS**: `virtualdisplay.client.cjs.js` - Node.js compatibility
- **UMD**: `virtualdisplay.client.umd.js` - Universal module definition

## How it works
1. **Add an iframe to your site:** Point it to our managed Virtual Display server, specifying the product model and license.
2. **Connect with the client library:** Use the Virtual Display Client (`@virtualdisplay-io/client`) to control the model: send state, listen for updates, etc.
3. **Keep your UI and the model in sync:** Any UI (dropdown, slider, button) can update the 3D visualization live, and vice versa.

## Quickstart

### Using the Builder Pattern (Recommended)

```javascript
import { VirtualDisplayClient } from '@virtualdisplay-io/client';

const options = {
  parent: '#virtual-display-container',
  license: 'YOUR_LICENSE',
  model: 'YOUR_MODEL',
  style: { background: '#f9fafb' },
  title: 'Product Configurator',
  classNames: 'w-full h-full min-h-[400px]'
};

const client = await VirtualDisplayClient.builder(options);

// Send state updates
client.sendClientState({
  attributes: [
    { name: 'Color', values: [{ value: 'Red', identifiers: ['color-red'], isSelected: true }] }
  ]
});
```

### Using Direct Iframe Integration

```html
<iframe
  id="virtual-display-iframe"
  src="https://virtualdisplay.io/model?license=YOUR_LICENSE&model=YOUR_MODEL"
  allowfullscreen
></iframe>
```

```javascript
import { VirtualDisplayClient } from '@virtualdisplay-io/client';

const client = new VirtualDisplayClient('#virtual-display-iframe');
client.sendClientState({
  attributes: [
    { name: 'Color', values: [{ value: 'Red', identifiers: ['color-red'], isSelected: true }] }
  ]
});
```

## Demo Projects

Explore our comprehensive examples to understand different integration patterns:

- **[Simple Model Integration](examples/simple-model-integration)** – Minimal integration for displaying 3D models without configuration options. Perfect for static product visualization.

- **[Variable Products](examples/variable-products)** – Complex product configurator with attribute-driven variations and real-time updates. Ideal for e-commerce with customizable products.

- **[Tree Response Demo](examples/tree-response)** – Advanced example showing how to fetch the complete model tree structure (meshes, variants, materials) via the message bus API.
