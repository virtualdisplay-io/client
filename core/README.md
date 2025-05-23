# @virtualdisplay-io/client

The core Virtual Display client package. It adds an API to show/hide parts of a 3D model based on e-commerce options like mesh, material or variant.

## Features

- ✅ Show/hide mesh, materials, and variants
- ✅ Emit and receive model state
- ✅ Works standalone in an iframe

## Installation

```bash
npm install @virtualdisplay-io/client
```

or
```bash
pnpm add @virtualdisplay-io/client
```

## Usage

```javascript
import { VirtualDisplayClient, State } from '@virtualdisplay-io/client';

// define state that the model should transfor to
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

// create a new client instance and pass the state to it
const client = new VirtualDisplayClient('#virtual-display');
client.sendClientState(state);
```
