# Contributing to @virtualdisplay.io/client

## Development setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Run tests: `pnpm test`
4. Start development: `pnpm dev`

## Code standards

This project uses Virtualdisplay shared configuration for:

- ESLint with strict defensive programming rules
- TypeScript with maximum type safety
- Prettier for consistent formatting
- Vitest for testing

## Pull request process

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

### Before submitting

- Run `pnpm validate` to ensure all checks pass
- Write tests for new functionality
- Update documentation as needed
- Follow the existing code style

## Commit messages

Follow conventional commits specification for automated releases:

### Release types

- `feat:` New feature (minor release)
- `fix:` Bug fix (patch release)
- `perf:` Performance improvement (patch release)
- `refactor:` Code refactoring (patch release)
- `revert:` Revert previous changes (patch release)

### Non-release types

- `docs:` Documentation changes (no release)
- `style:` Code style changes (no release)
- `test:` Test changes (no release)
- `chore:` Build process or tooling (no release)
- `ci:` CI configuration changes (no release)
- `build:` Build system changes (no release)

### Breaking changes

- Add `BREAKING CHANGE:` in commit body for major release
- Or use `scope: BREAKING` for major release

### Examples

```bash
feat: add new user authentication system
fix: resolve memory leak in data processing
perf: optimize database queries for faster response
refactor: simplify user validation logic
docs: update API documentation with new endpoints
```

## Questions or help

For questions or help, please contact: [support@virtualdisplay.io](mailto:support@virtualdisplay.io)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
