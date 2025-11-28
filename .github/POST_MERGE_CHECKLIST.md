# Post-Merge Checklist

After merging the CI/CD changes, complete these steps to fully activate the automated testing pipeline.

## Required Actions

### 1. Update README Badge
Replace `YOUR_USERNAME` in the badge URL with your actual GitHub username/organization:

```markdown
[![PR Checks](https://github.com/YOUR_USERNAME/waypoint-coop/actions/workflows/pr-checks.yml/badge.svg)](https://github.com/YOUR_USERNAME/waypoint-coop/actions/workflows/pr-checks.yml)
```

Find and replace in `README.md`.

### 2. Enable GitHub Actions
If not already enabled:

1. Go to repository Settings
2. Click "Actions" → "General"
3. Ensure "Allow all actions and reusable workflows" is selected
4. Click "Save"

### 3. Set Up Branch Protection (Recommended)

Protect the `main` branch:

1. Go to Settings → Branches
2. Click "Add rule" or edit existing rule for `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
4. Select required status checks:
   - `Lint and Type Check`
   - `Build`
   - `Run Tests`
5. Click "Save changes"

### 4. Test the Workflow

Create a test PR to verify everything works:

```bash
git checkout -b test/ci-workflow
echo "# Test" >> TEST.md
git add TEST.md
git commit -m "Test CI workflow"
git push origin test/ci-workflow
```

Then open a PR and verify:
- ✅ All three jobs run
- ✅ All checks pass
- ✅ Status appears in PR

Delete the test branch after verification.

### 5. Configure Notifications (Optional)

Set up Slack/Discord notifications for CI failures:

1. Install GitHub app for your chat platform
2. Configure to post on CI failures
3. Select the `pr-checks` workflow

## Optional Enhancements

### Add Code Coverage

Install coverage tool:

```bash
npm install -D @vitest/coverage-c8
```

Update workflow to upload coverage reports.

### Add Dependabot

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

### Add Security Scanning

Enable Dependabot security updates:
1. Settings → Security → Dependabot
2. Enable "Dependabot security updates"

### Add Performance Monitoring

Consider adding:
- Lighthouse CI for performance testing
- Bundle size tracking
- Load time monitoring

## Verification

✅ Badge shows on README  
✅ Workflow runs on new PRs  
✅ Branch protection active  
✅ Team notified about process  

## Next Steps

1. Document the testing process in team wiki
2. Add test coverage requirements
3. Set up automated deployments
4. Configure preview environments for PRs

## Questions?

Refer to:
- `.github/workflows/README.md` - Workflow documentation
- `.github/QUICK_START.md` - Quick reference
- `.github/CI_CD_SUMMARY.md` - Complete overview
- `CONTRIBUTING.md` - Contributor guide

## Rollback Plan

If issues arise:

```bash
git revert <commit-hash>
```

Or temporarily disable the workflow:
1. Rename `.github/workflows/pr-checks.yml` to `pr-checks.yml.disabled`
2. Commit and push
