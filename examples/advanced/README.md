# Virtual Display – Advanced Demo

This demo shows a real-world product configurator with multiple options (tabletop, legs, material, etc.) using Virtual Display.

- Shows how to use the client library to send and sync state
- Live feedback via logger
- See the [root README](../README.md) for background and setup info

## Try it

Run it using pnpm:
```bash
pnpm dev
```

Open `http://localhost:4002/` in your browser.

## How it works

- An `<iframe>` loads the Virtual Display server with the correct model and license.
- Dropdowns and controls are bound to the UI.
- Every change updates the model state via the client.
- The model changes in real-time based on the selected options.

See `/src/index.ts` for the integration code.
