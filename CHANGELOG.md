# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.2.1](https://github.com/virtualdisplay-io/client/compare/v3.2.0...v3.2.1) (2025-06-30)

### 🐛 Bug Fixes

* prevent .env from being used in production builds ([#48](https://github.com/virtualdisplay-io/client/issues/48)) ([7ab54d0](https://github.com/virtualdisplay-io/client/commit/7ab54d02a9aad94daf5a53899fefa9299f9bf73f))

## [3.2.0](https://github.com/virtualdisplay-io/client/compare/v3.1.0...v3.2.0) (2025-06-27)

### ✨ Features

* publish client package to npm registry ([#45](https://github.com/virtualdisplay-io/client/issues/45)) ([825810b](https://github.com/virtualdisplay-io/client/commit/825810b0ca56da8e50f34f2afac9f75a87acbc40))

### 🐛 Bug Fixes

* improve GitHub Actions authentication and remove .env.act ([#47](https://github.com/virtualdisplay-io/client/issues/47)) ([3acc86e](https://github.com/virtualdisplay-io/client/commit/3acc86e5c27a26af0b77cc23ddff397eee141de5))
* use GITHUB_TOKEN for checkout action ([#46](https://github.com/virtualdisplay-io/client/issues/46)) ([f8d60fb](https://github.com/virtualdisplay-io/client/commit/f8d60fba2547950137de10838bcfc874e78d9f33))

### 📝 Documentation

* update README version reference to v3.1 ([#44](https://github.com/virtualdisplay-io/client/issues/44)) ([1652c15](https://github.com/virtualdisplay-io/client/commit/1652c157890ca43d1e366b302a37f02465d6450b))

## [3.1.0](https://github.com/virtualdisplay-io/client/compare/v3.0.0...v3.1.0) (2025-06-25)

### ⚠ BREAKING CHANGES

* Complete API redesign with the following changes:
- Removed isReady getter - use onReady callback instead
- Removed getQueueStatus method - internal implementation detail
- Removed toJSON from ModelNode - not needed for public API
- Complete restructure from core/ to src/ with domain-driven design
- New attribute-based API is now the only way to interact with 3D models
- Fire-and-forget messaging pattern for all operations
- JSON Schema validation for mapping configuration

Features:
- Simplified color configurator demo (300 lines → 160 lines)
- Bundled @virtualdisplay-io/logger package
- Domain-driven directory structure
- Proper error handling with error codes
- Event-driven architecture with EventBus
- onChange callbacks for real-time UI synchronization
- Comprehensive test coverage

Documentation:
- Complete README rewrite focusing on actual functionality
- Added terminology standards for consistent communication
- Removed unimplemented accessibility claims
- Clear separation between simple and configurable products

* fix: update lockfile after removing translator dependency

* docs: update README for v4.0 release

* fix: add GitHub registry configuration for @virtualdisplay-io scope

* fix: add npm authentication to bundle-size workflow and package permissions

* fix: use GITHUB_TOKEN for npm auth and add trailing slash to registry URL

* chore: update lockfile with fresh install

* fix: use GH_PAT instead of GITHUB_TOKEN for package authentication

- Replace GITHUB_TOKEN with GH_PAT in all workflows to avoid conflicts with GitHub's reserved token
- Update CI, release, and bundle-size workflows to use new token variable
- Add .env.act for local testing with act
- Required because GitHub's automatic GITHUB_TOKEN cannot access private organization packages

* fix: remove push trigger from bundle-size workflow

- Bundle size analysis should only run on pull requests
- Prevents duplicate runs and confusion about which branch is being tested
- Aligns with CI/CD best practices for PR-based workflows

### ✨ Features

* v4.0.0 - simplified architecture and attribute-only API ([#41](https://github.com/virtualdisplay-io/client/issues/41)) ([dc649c1](https://github.com/virtualdisplay-io/client/commit/dc649c1b863b2427bf6e0350960c4d2e2a2dacb8))

### 🐛 Bug Fixes

* add missing conventional-changelog-conventionalcommits dependency ([8a15743](https://github.com/virtualdisplay-io/client/commit/8a15743de3984c742ccb5de0537333f321108cd4))
* use NODE_AUTH_TOKEN for npm authentication ([#43](https://github.com/virtualdisplay-io/client/issues/43)) ([c148c6c](https://github.com/virtualdisplay-io/client/commit/c148c6cba6b6b4d1fc431ca5618ad2c3c26638c2))

### 🔧 Maintenance

* trigger release workflow to test GH_PAT secret ([9b07140](https://github.com/virtualdisplay-io/client/commit/9b07140e01d72ccc3774f20733afd197f52c4cde))
