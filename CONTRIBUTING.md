# Contributing to Virtual Display Client

First off, thank you for considering contributing to Virtual Display Client! It's people like you that make this project a great tool for the 3D development community.

## 🌟 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🚀 Quick Start

### Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/client.git
cd client

# Install dependencies (we use pnpm for consistency)
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint and format
pnpm lint && pnpm format
```

### Making Changes

1. **Fork** the repository
2. **Create a feature branch** from `main`
3. **Make your changes** with tests
4. **Run the test suite** to ensure everything passes
5. **Submit a pull request**

## 📋 Development Guidelines

### Code Quality Standards

- **Test Coverage**: Minimum 95% for new features
- **TypeScript**: Strict mode, no `any` types allowed
- **Accessibility**: WCAG 2.1 AA compliance required
- **Documentation**: JSDoc comments for all public APIs
- **Performance**: Consider bundle size impact

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(client): add iframe builder functionality
fix(message): resolve queue memory leak
docs(readme): update installation instructions
test(utils): add comprehensive utility tests
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `style`: Code style changes
- `chore`: Build process or auxiliary tool changes
- `build`: Changes to build configuration or external dependencies

### Code Style

```typescript
// ✅ Good: Explicit types, clear naming
export interface ClientState {
  readonly attributes: readonly Attribute[];
  readonly version: string;
  readonly timestamp: number;
}

// ❌ Bad: Any types, unclear naming
export interface State {
  attrs: any[];
  v: string;
  t: number;
}
```

## 🧪 Testing

### Test Structure

```typescript
// tests/feature.test.ts
import { describe, it, expect, beforeEach } from 'vitest';

describe('FeatureName', () => {
  describe('when initializing', () => {
    it('should create instance with default options', () => {
      const instance = new Feature();
      expect(instance).toBeDefined();
      expect(instance.options).toEqual(defaultOptions);
    });
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run core library tests
cd core && npm test

# Run specific test file
pnpm test -- tests/client.test.ts

# Run tests in watch mode
pnpm test -- --watch
```

## ♿ Accessibility Requirements

All contributions must maintain WCAG 2.1 AA compliance:

- **Keyboard Navigation**: All functionality accessible via keyboard
- **Screen Readers**: Proper ARIA labels and descriptions
- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Focus Management**: Visible focus indicators
- **Semantic HTML**: Use appropriate HTML elements

## 📖 Documentation

### JSDoc Standards

```typescript
/**
 * Send client state to the Virtual Display server
 *
 * @param state The client state containing attributes
 * @throws {Error} When iframe is not initialized
 * @example
 * ```typescript
 * client.sendClientState({
 *   attributes: [
 *     { name: 'Color', values: [{ value: 'Red', identifiers: ['red'], isSelected: true }] }
 *   ]
 * });
 * ```
 */
public sendClientState(state: ClientState): void {
  // Implementation
}
```

### README Updates

When adding new features, update:
- Feature list in README
- API documentation section
- Usage examples
- Integration guides

## 🐛 Bug Reports

### Before Submitting

1. **Search existing issues** to avoid duplicates
2. **Update to latest version** to see if issue persists
3. **Check browser compatibility** for environment-specific issues

### Bug Report Template

```markdown
**Bug Description**
Clear description of the issue

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Environment**
- OS: [e.g., macOS 13.0]
- Browser: [e.g., Chrome 120.0]
- Client Version: [e.g., 1.6.2]
- Framework: [e.g., React 18.2]

**Additional Context**
Screenshots, error logs, etc.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Feature Description**
Clear description of the proposed feature

**Use Case**
Why is this feature needed? What problem does it solve?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Mockups, examples from other tools, etc.
```

## 🚀 Pull Request Process

### Before Submitting

- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Accessibility tested
- [ ] Performance impact considered

### Review Process

1. **Automated Checks**: CI runs tests and linting
2. **Code Review**: Maintainer reviews code quality
3. **Documentation Review**: Clarity and completeness
4. **Performance Review**: Bundle size and runtime impact
5. **Final Approval**: Merge when all checks pass

## 🏗️ Project Structure

```
client/
├── core/                   # Core library package
│   ├── src/               # Source code
│   ├── tests/             # Test files
│   └── dist/              # Build output
├── examples/              # Example implementations
│   ├── simple-model-integration/
│   ├── variable-products/
│   └── tree-response/
├── docs/                  # Documentation
└── pnpm-workspace.yaml    # Workspace configuration
```

## 🎯 Roadmap Participation

We maintain our roadmap in GitHub Projects. Contributors can:

- Comment on planned features
- Propose new roadmap items
- Volunteer for specific initiatives
- Join working groups for major features

## 💬 Communication

### Getting Help

- **GitHub Discussions**: General questions and ideas
- **GitHub Issues**: Bug reports and feature requests
- **Stack Overflow**: Technical questions (`virtual-display` tag)

### Reporting Security Issues

Please **DO NOT** open public issues for security vulnerabilities. Instead, email us at [support@virtualdisplay.io](mailto:support@virtualdisplay.io).

## 🏆 Recognition

Contributors are recognized in:

- **README Contributors Section**
- **Release Notes**
- **Annual Contributor Report**
- **Social Media Highlights**

## 📄 License

By contributing to Virtual Display Client, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for contributing to Virtual Display Client! 🎉