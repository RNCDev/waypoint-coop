# CI/CD Quick Start Guide

## For Contributors

### Before Opening a PR

Run these commands locally to catch issues early:

```bash
npm run lint
npm run type-check  
npm run build
npm test
```

If all pass, your PR will likely pass CI! ✅

### When Your PR Fails CI

Click on the failed check in your PR to see logs:

1. **Lint Failed?**
   ```bash
   npm run lint -- --fix
   git add .
   git commit -m "Fix lint issues"
   git push
   ```

2. **Type Check Failed?**
   ```bash
   npm run type-check
   ```
   Fix TypeScript errors, commit, and push.

3. **Build Failed?**
   ```bash
   npm run build
   ```
   Fix build errors, commit, and push.

4. **Tests Failed?**
   ```bash
   npm test
   ```
   Fix failing tests, commit, and push.

## For Maintainers

### Viewing Workflow Results

1. Go to the "Actions" tab in GitHub
2. Click on a workflow run
3. View job details and logs

### Updating Branch Protection

1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable "Require status checks to pass"
4. Select: Lint and Type Check, Build, Run Tests

### Workflow Triggers

Current triggers:
- PRs to `main` or `develop`
- Pushes to `main` or `develop`

To modify, edit `.github/workflows/pr-checks.yml`

## Common Issues

### "npm ci" fails
- Delete `package-lock.json` locally
- Run `npm install`
- Commit the new lockfile

### Workflow doesn't trigger
- Check branch name matches `main` or `develop`
- Ensure workflow file is in `.github/workflows/`
- Check GitHub Actions is enabled in repo settings

### Jobs timeout
- Default timeout: 60 minutes
- Add `timeout-minutes: 30` to job if needed

## Advanced

### Running specific jobs locally

Using [act](https://github.com/nektos/act):

```bash
act pull_request
```

### Debugging workflow

Add debug logging:

```yaml
- name: Debug info
  run: |
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    ls -la
```

## Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- Project workflow: `.github/workflows/pr-checks.yml`
