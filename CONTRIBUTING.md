# Contributing to Waypoint Coop

Thank you for considering contributing to Waypoint Coop! This document outlines the process for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature or fix
4. Make your changes
5. Commit your changes with clear commit messages
6. Push to your fork
7. Open a pull request

## Development Workflow

### Setting Up Your Environment

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

### Before Submitting a PR

Make sure your code passes all checks:

```bash
npm run lint
npm run type-check
npm run build
npm test
```

These same checks will run automatically in CI when you open a PR.

## Pull Request Process

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the project's coding standards

3. **Test your changes** locally

4. **Commit your changes** with descriptive commit messages:
   ```bash
   git commit -m "Add feature: description of what you added"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** targeting the `main` branch

### PR Requirements

All PRs must pass the following automated checks:

- **Lint Check**: Code must pass ESLint rules
- **Type Check**: Code must pass TypeScript type checking
- **Build**: Application must build successfully
- **Tests**: All tests must pass (when tests are present)

### PR Review Process

1. Automated checks will run on your PR
2. A maintainer will review your code
3. Address any feedback or requested changes
4. Once approved, your PR will be merged

## Code Style

- Follow the existing code style
- Use TypeScript for all new code
- Keep components simple and focused
- Write clear, descriptive variable and function names
- No comments unless absolutely necessary for complex logic

## Testing

When adding new features:

- Add tests for new functionality
- Update existing tests if behavior changes
- Ensure all tests pass before submitting PR

## Questions?

If you have questions, feel free to:
- Open an issue for discussion
- Ask in the PR comments
- Check existing issues and PRs for similar discussions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
