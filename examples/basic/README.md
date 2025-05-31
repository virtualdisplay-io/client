# Virtual Display – Basic Demo

This basic demo shows the simplest way to embed a simple 3D model on your website using Virtual Display.

- **No configuration or variants:** Just display a single 3D product, as-is
- **Perfect for simple products, marketing pages, or proof-of-concept**
- **Full source code included:** See exactly how to use the iframe and the client library

## What does it show?

- How to embed a 3D model using an `<iframe>`
- How the [Virtual Display Client](https://www.npmjs.com/package/@virtualdisplay-io/client) connects to the 3D server.

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

> For more information about advanced use cases, see the [Advanced Demo](../advanced/README.md) or the [root README](../../README.md).
