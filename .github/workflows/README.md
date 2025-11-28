# GitHub Actions Workflows

## PR Checks (`pr-checks.yml`)

This workflow runs automated checks on every pull request to ensure code quality and prevent breaking changes.

### When it runs

- On pull requests targeting `main` or `develop` branches
- On direct pushes to `main` or `develop` branches

### Jobs

#### 1. Lint and Type Check
- Runs ESLint to catch code quality issues
- Runs TypeScript type checking to catch type errors
- Fast feedback for code style and type safety

#### 2. Build
- Generates Prisma client
- Builds the Next.js application
- Ensures the application can be deployed successfully

#### 3. Test
- Runs the test suite
- Only runs if test files are detected
- Currently configured to work with Jest, Vitest, or any testing framework

### Required Secrets

No secrets are required for these checks. They run with default GitHub Actions permissions.

### Extending the workflow

To add more checks:
1. Add a new job in the workflow file
2. Follow the same pattern: checkout, setup Node, install deps, run check
3. Jobs run in parallel by default for faster CI times

### Local testing

Before pushing, you can run the same checks locally:

```bash
npm run lint
npm run type-check
npm run build
npm test
```
