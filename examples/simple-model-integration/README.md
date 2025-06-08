# Virtual Display – Simple Model Integration

This demo shows how to integrate a 3D model without meshes or variants into your website using Virtual Display.

- **No meshes or variants:** Display a complete 3D model as-is without configurability
- **Perfect for product showcases, marketing pages, or static 3D content**
- **Full source code included:** See exactly how to use the iframe and the client library

## What does it show?

- How to embed a static 3D model using an `<iframe>`
- How the [Virtual Display Client](https://www.npmjs.com/package/@virtualdisplay-io/client) connects to the 3D server for model display

## Try it yourself

Run it using pnpm:
```bash
pnpm dev
```

Open `http://localhost:4001/` in your browser.

## How it works

1. An `<iframe>` is added to the page with the correct `src` (model + license).
2. The Virtual Display Client attaches to the iframe.
3. The iframe displays the simple 3D model.

See the code in `/src/index.ts` for more details.

> For more information about configurable products, see the [Variable Products Demo](../variable-products/README.md) or the [root README](../../README.md).
