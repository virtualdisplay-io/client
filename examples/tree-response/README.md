# Virtual Display – Tree Response Demo

This demo shows how to use the Virtual Display client message bus to request and receive the model tree from the server.

- **For advanced use cases**: Learn how to fetch all available meshes, variants, and materials via an event-based API.
- **Great for integration**: This approach is ideal when you want to dynamically build UIs or map product options to model components.

## What does it show?

- How to send a tree request over the message bus.
- How to listen for the tree response event.
- How to display the model tree in the UI.

## Try it yourself

Run it using pnpm:

```bash
pnpm dev
```

Open `http://localhost:4003/` in your browser.

## How it works

1.	An `<iframe>` is added to the page with the Virtual Display server.
2.	The client connects and exposes a message bus.
3.	When you click “Request Model Tree”, the client sends a request event via the message bus.
4.	The server responds with the full model tree, which is shown in the UI.

See the code in `/src/index.ts` for details.

For other use cases, see the [Basic Demo](../basic) or [Advanced Demo](../advanced).
