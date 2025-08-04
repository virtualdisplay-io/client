# Virtualdisplay client

TypeScript library for embedding interactive 3D product models in web applications.

## Installation

```bash
npm install @virtualdisplay.io/client
# or
pnpm add @virtualdisplay.io/client
# or
yarn add @virtualdisplay.io/client
```

## Quick start

### Simple product (no options)

```typescript
import { VirtualdisplayClient } from '@virtualdisplay.io/client';

// That's it! Your 3D model is now displayed
const client = new VirtualdisplayClient({
  parent: '#product-container',
  license: 'your-license-key',
  model: 'statue-model',
});
```

### Configurable product (with options)

```typescript
import { VirtualdisplayClient } from '@virtualdisplay.io/client';

// Create client instance
const client = new VirtualdisplayClient({
  parent: '#product-container',
  license: 'your-license-key',
  model: 'sneaker',
});

// Map product options to 3D parts
client.setMapping({
  attributes: [
    {
      name: 'Color',
      values: [
        { value: 'Red', nodeIds: ['laces_red', 'sole_red'], isSelected: true },
        { value: 'Blue', nodeIds: ['laces_blue', 'sole_blue'] },
      ],
    },
  ],
});

// Control via product options
client.getAttribute('Color')?.select('Red');
```

## Key features

- **Simple API**: Attribute-based product configuration
- **Fire-and-forget**: Send commands without waiting for responses
- **State sync**: Automatic synchronization between client and 3D viewer
- **Framework-agnostic**: Works with React, Vue, Angular, or vanilla JS
- **TypeScript first**: Full type safety and IntelliSense support
- **Minimal dependencies**: Only essential validation and logging included

## Documentation

For complete documentation including:

- API reference
- Advanced examples
- Integration guides
- Architecture diagrams
- Troubleshooting

Visit our [GitHub repository](https://github.com/virtualdisplay-io/client)
