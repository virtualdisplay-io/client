## [1.3.1](https://github.com/virtualdisplay-io/client/compare/v1.3.0...v1.3.1) (2025-06-01)

### Bug Fixes

* response content referred to node ([c96fd47](https://github.com/virtualdisplay-io/client/commit/c96fd478e358db82e10aca1d412f548d6a80286c))

## [1.3.0](https://github.com/virtualdisplay-io/client/compare/v1.2.0...v1.3.0) (2025-05-31)

### Features

* added a more advanced example, this example showcases how to set the default state of the model and how to change it active meshes and variants. ([ae2b491](https://github.com/virtualdisplay-io/client/commit/ae2b491e0d348a7c79af87f7fbc2e9ca24f0c3d9))
* added a proper basic demo, this will help developers understand how to use the client. ([c5abd6f](https://github.com/virtualdisplay-io/client/commit/c5abd6faa211c90e176e667cb39847afa781d2b6))
* added another demo, this demo showcases how to use the request model feature. the feature exposes an object that can be used to build interfaces to find mesh and variant identifiers, for further use. ([c8ac2b3](https://github.com/virtualdisplay-io/client/commit/c8ac2b34fe9d9077746e1b76b2653ac7dd3958a3))
* **ifame builder:** introduces a new iframe builder for easier integration. ([0783c73](https://github.com/virtualdisplay-io/client/commit/0783c730c2df5a17bd75019c5caf74f4e6a8669b))
* introduce a queue that will keep any messages until the iframe element has loaded / generated. this makes sure that no messages are dropped due to the iframe not beeing ready yet. ([e4e607f](https://github.com/virtualdisplay-io/client/commit/e4e607f35567b9950a94892603a4e699ed3ef7f9))
* introduce new type to use to define the origin of the message, added state into the mix too. this will make VirtualDisplayMessageEventData typings more clear. ([32762fc](https://github.com/virtualdisplay-io/client/commit/32762fc6c4953caf7169129fe9c9cec474c3e3f4))
* introduced env variable ([c834148](https://github.com/virtualdisplay-io/client/commit/c8341481478804ceb6fb3c2fce43b4ab36c13881))
* so, this is the newly introduced type ([b08358e](https://github.com/virtualdisplay-io/client/commit/b08358e53cb766e864a90158fbad415a6d7e8a85))

### Bug Fixes

* make sure we always have a hostname ([40b68ae](https://github.com/virtualdisplay-io/client/commit/40b68ae9cbe9cb7d8a75e28fd1a715c643a9463c))
* the vw and vh cannot be used by the iframe. the iframe should optimize within the space it was given, not the whole view. ([3b8604e](https://github.com/virtualdisplay-io/client/commit/3b8604ea8fb7b7bb6353988060dd3ad84f6ffe54))

## [1.2.0](https://github.com/virtualdisplay-io/client/compare/v1.1.0...v1.2.0) (2025-05-29)

### Features

* introduced the iframe-factory to do validation and make sure the iframe element has all the required attributes and values. ([85afd70](https://github.com/virtualdisplay-io/client/commit/85afd704140c121b09492bc2a89a93884df4fabf))

## [1.1.0](https://github.com/virtualdisplay-io/client/compare/v1.0.5...v1.1.0) (2025-05-28)

### Features

* deprecate MESSAGE_EVENT_SET_MODEL_STATE will be fixed differently ([ee0b4e5](https://github.com/virtualdisplay-io/client/commit/ee0b4e5bebe8dd69170e07fd87dd692d842f0079))
* renamed MESSAGE_EVENT_GET_MODEL_TREE and MESSAGE_EVENT_SEND_MODEL_TREE into MESSAGE_EVENT_MODEL_TREE_REQUEST and MESSAGE_EVENT_MODEL_TREE_RESPONSE to make the flow of information more clear. ([d887fb9](https://github.com/virtualdisplay-io/client/commit/d887fb9d626e57f8200a8ddf84b0ff333b1f744e))

## [1.0.5](https://github.com/virtualdisplay-io/client/compare/v1.0.4...v1.0.5) (2025-05-23)

### Bug Fixes

* add missing jsdom file ([6cddc20](https://github.com/virtualdisplay-io/client/commit/6cddc20fe0360e1abd20c632ec8418d36e85cf64))

## [1.0.4](https://github.com/virtualdisplay-io/client/compare/v1.0.3...v1.0.4) (2025-05-23)

### Bug Fixes

* renamed from [@virtual-display](https://github.com/virtual-display) to [@virtualdisplay-io](https://github.com/virtualdisplay-io) ([a199b18](https://github.com/virtualdisplay-io/client/commit/a199b18f7f1906aa38fc83980e9aee6d4392fb10))

## [1.0.3](https://github.com/virtualdisplay-io/client/compare/v1.0.2...v1.0.3) (2025-05-23)

### Bug Fixes

* correct the url for the repository. ([f2a1d10](https://github.com/virtualdisplay-io/client/commit/f2a1d100d5e112e750abe14eb18bb8a0d1ab1703))

## [1.0.2](https://github.com/virtualdisplay-io/client/compare/v1.0.1...v1.0.2) (2025-05-23)

### Bug Fixes

* correct the paths to the commands ([f65c3a2](https://github.com/virtualdisplay-io/client/commit/f65c3a2495084906f6b15631e1cba793c99d28f0))
* correct the paths to the pnpm-lock file ([704d1ab](https://github.com/virtualdisplay-io/client/commit/704d1ab568a8b95ce0a12c58aee959ca93abd65d))
* try Github Packages as package manager. ([c0ed41b](https://github.com/virtualdisplay-io/client/commit/c0ed41b9b32435f2d02deef6719ebbdca2b3b72e))
* update lock file ([e3f8540](https://github.com/virtualdisplay-io/client/commit/e3f854026fc276c181370553462e177266baaae7))

# Changelog

All notable changes to this project will be documented in this file.

## 1.0.0 (2025-05-22)

Initial release of the `@virtualdisplay-io/client` package.

- Add public API to control visibility of meshes, materials, and variants.
- Add type definitions and ESM/CJS/UMD builds.
- Add semantic-release support and GitHub CI workflow.
