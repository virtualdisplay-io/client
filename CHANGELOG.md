# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.7.0](https://github.com/virtualdisplay-io/client/compare/v3.6.0...v3.7.0) (2025-08-05)

### ✨ Features

* dynamic mapping - proxy release ([#9](https://github.com/virtualdisplay-io/client/issues/9)) ([a95f0e7](https://github.com/virtualdisplay-io/client/commit/a95f0e7a7672b844571b11307637083c6b487f3f)), closes [#8](https://github.com/virtualdisplay-io/client/issues/8)

### 🔧 Maintenance

* various fixes and documentation updates ([#7](https://github.com/virtualdisplay-io/client/issues/7)) ([325150b](https://github.com/virtualdisplay-io/client/commit/325150b41bd557e7426e6dae6780cd4fd7660deb))

## [3.6.0](https://github.com/virtualdisplay-io/client/compare/v3.5.1...v3.6.0) (2025-07-23)

### ✨ Features

* add camera configuration support ([#6](https://github.com/virtualdisplay-io/client/issues/6)) ([a6bce4b](https://github.com/virtualdisplay-io/client/commit/a6bce4bfd0d55362e76c893ddf5ed28409dc8bec))

## [3.5.1](https://github.com/virtualdisplay-io/client/compare/v3.5.0...v3.5.1) (2025-07-18)

### ♻️ Code Refactoring

* remove validation of outgoing message types ([#5](https://github.com/virtualdisplay-io/client/issues/5)) ([5f4f985](https://github.com/virtualdisplay-io/client/commit/5f4f9853d65af676aec3a865864f43461fdb6ca5))

## [3.5.0](https://github.com/virtualdisplay-io/client/compare/v3.4.1...v3.5.0) (2025-07-16)

### ✨ Features

* camera control API ([#4](https://github.com/virtualdisplay-io/client/issues/4)) ([1e4c147](https://github.com/virtualdisplay-io/client/commit/1e4c14747cad2a4617c4cc763522b50941adaa7f))

## [3.4.1](https://github.com/virtualdisplay-io/client/compare/v3.4.0...v3.4.1) (2025-07-10)

### 🐛 Bug Fixes

* EventBus once handlers and logging improvements ([#3](https://github.com/virtualdisplay-io/client/issues/3)) ([5a99d8d](https://github.com/virtualdisplay-io/client/commit/5a99d8d6ef82d058799734b54c98ca171d17dd36))

## [3.4.0](https://github.com/virtualdisplay-io/client/compare/v3.3.0...v3.4.0) (2025-07-09)

### ✨ Features

* implement UI configuration via PostMessage CONFIG messages ([#2](https://github.com/virtualdisplay-io/client/issues/2)) ([abc2294](https://github.com/virtualdisplay-io/client/commit/abc229414f9f70c54f37db903c46c0612c5eb6cf))

## [3.3.0](https://github.com/virtualdisplay-io/client/compare/v3.2.2...v3.3.0) (2025-07-07)

### ✨ Features

* add isInitial flag to StateMessage ([#50](https://github.com/virtualdisplay-io/client/issues/50)) ([8590354](https://github.com/virtualdisplay-io/client/commit/859035423e161f43791433baac203b2adb95c9fd))

## [3.2.2](https://github.com/virtualdisplay-io/client/compare/v3.2.1...v3.2.2) (2025-07-01)

### 🐛 Bug Fixes

* change default logger level to warn ([#49](https://github.com/virtualdisplay-io/client/issues/49)) ([a567db2](https://github.com/virtualdisplay-io/client/commit/a567db23a50173e3b167238af2197e545bda6320))

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
