# Virtual Display
Virtual Display is a powerful toolkit for embedding interactive 3D product configurators in any webshop, CMS, or web application. Using our secure, managed 3D server, you can visualize products with unlimited options—without worrying about rendering, performance, or model management.

## Features
- ⚡ Seamless 3D integration via `<iframe>` or web component
- 🔀 Real-time state synchronization between your UI and the 3D model
- 🛒 Optimized for e-commerce (variants, materials, dynamic meshes)
- 🧩 Framework-agnostic: works with React, Vue, plain JS, etc.
- 🔒 Fully managed backend—no hosting or scaling worries

## How it works
1. **Add an iframe to your site:** Point it to our managed Virtual Display server, specifying the product model and license.
2. **Connect with the client library:** Use the Virtual Display Client (`@virtualdisplay-io/client`) to control the model: send state, listen for updates, etc.
3. **Keep your UI and the model in sync:** Any UI (dropdown, slider, button) can update the 3D visualization live, and vice versa.

## Quickstart
```html
<iframe
  id="virtual-display-iframe"
  src="https://virtualdisplay.io/model?license=YOUR_LICENSE&model=YOUR_MODEL"
  allowfullscreen
></iframe>
```

```javascript
import { VirtualDisplayClient, State } from '@virtualdisplay-io/client';

const client = new VirtualDisplayClient('#virtual-display-iframe');
client.sendClientState({
  attributes: [
    { name: 'Color', values: [ { value: 'Red', identifiers: ['color-red'], isSelected: true } ] }
  ]
});
```

## Demo projects
- [Basic Demo](/examples/basic) – Minimal integration, for simple products and models.
- [Advanced Demo](/examples/advanced) – Complex product configurator, for dynamic options and real-time updates.
