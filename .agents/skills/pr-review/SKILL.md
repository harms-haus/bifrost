---
name: pr-review
description: |
  Use this skill when asked to review a GitHub pull request using the `gh` CLI.
  
  This skill provides tools and guidance for PR reviews. Invoke this skill BEFORE
  performing a PR review, then follow the /pr-review workflow for the step-by-step
  process.
---

## Workflow

After invoking this skill, follow the **/pr-review** workflow for the procedural steps:
1. Gather PR Information
2. Fetch the Diff
3. Analyze Changes
4. Submit Review
5. Add Line Comments

## Review Checklist

### Code Quality

- [ ] Code compiles without errors
- [ ] No obvious logic errors or bugs
- [ ] Follows project coding standards
- [ ] No hardcoded secrets or credentials
- [ ] Proper error handling
- [ ] No unnecessary complexity

### Testing

- [ ] New code has appropriate tests
- [ ] Tests are meaningful (not just coverage)
- [ ] Edge cases are tested
- [ ] Mocking is appropriate

### Documentation

- [ ] Public APIs documented
- [ ] Complex logic explained
- [ ] README updated if needed
- [ ] Changelog updated if applicable

### Performance

- [ ] No obvious performance regressions
- [ ] Appropriate data structures used
- [ ] No N+1 queries or similar issues

### Security

- [ ] Input validation present
- [ ] No SQL injection vectors
- [ ] No XSS vulnerabilities
- [ ] Authentication/authorization correct

## Common `gh` Commands Reference

```bash
# List open PRs
gh pr list --state open

# View PR in browser
gh pr view <NUMBER> --web

# Check PR mergeability
gh pr view <NUMBER> --json mergeable,mergeStateStatus

# View PR commits
gh pr view <NUMBER> --json commits

# Get PR files with additions/deletions
gh pr view <NUMBER> --json files --jq '.files[] | {path: .path, additions: .additions, deletions: .deletions}'

# View conversation/reviews
gh pr view <NUMBER> --comments

# Checkout PR locally for deeper analysis
gh pr checkout <NUMBER>
```

## Review Philosophy

### Your Job is to Find Problems

A code reviewer's primary responsibility is to **challenge** the implementation. You are the last line of defense before code enters the codebase. Be critical, be thorough, and **don't hold back**.

- **Be confrontational**: It's your job to raise issues, not to be agreeable
- **Challenge assumptions**: Ask "why this approach?" and "what about edge cases?"
- **Be skeptical**: Assume there are bugs; your job is to find them
- **Don't sugarcoat**: Direct feedback is more valuable than polite ambiguity
- **Block ruthlessly**: If something is wrong, request changes without hesitation

### Questions to Ask

- What could go wrong with this code?
- What did the author miss?
- What assumptions are invalid?
- What happens under load? With bad input? With concurrent access?
- Is this the simplest solution? If not, why not?
- Does this create technical debt?
- Will this be maintainable in 6 months?

### Red Flags to Hunt For

- Code that "should work" without evidence (tests)
- Copy-pasted logic (DRY violations)
- Premature abstraction
- Missing error handling
- Implicit assumptions about input/state
- Security-sensitive code without security review
- Performance-critical paths without benchmarking
- Changes that affect public APIs without migration path

## Tips for Effective Reviews

### Be Direct, Not Diplomatic

- Say "this is wrong because..." not "you might want to consider..."
- Say "this will cause bugs when..." not "there could be an issue here"
- Say "I cannot approve this because..." not "maybe we should revisit this"

### Be Specific

- Reference specific lines/files
- Provide concrete examples of failure modes
- Cite documentation or patterns when challenging an approach

### Prioritize Feedback

1. **Blocking issues**: Bugs, security, breaking changes - **always request changes**
2. **Important issues**: Performance, maintainability - **request changes if significant**
3. **Suggestions**: Style, minor improvements - note but don't block

### Don't Rubber-Stamp

Never approve a PR just to be nice. If you haven't found issues, you probably haven't looked hard enough. Every PR has room for improvement.

## Example Review Output

When using line comments (preferred), keep the review body minimal:

```
This PR adds OAuth authentication. I've left line comments on blocking issues.

## Questions

1. What happens if the OAuth provider is unavailable? I don't see retry logic or circuit breaking.
2. Why was this approach chosen over the existing `auth.Provider` interface?
3. Where are the integration tests for the full OAuth flow?

**REQUESTING CHANGES** - Please address the line comments before merge.
```

The detailed feedback belongs in line comments, not the review body.
