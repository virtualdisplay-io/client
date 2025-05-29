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
