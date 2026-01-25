---
name: pr
description: "Use this skill when the user requests to create a PR, uses phrases like 'create a PR', 'make a pull request', or '/pr'."
user-invocable: true
allowed-tools: Bash, Read, Write, AskUserQuestion
model: claude-haiku-4-5-20251001
---

You are an expert at creating well-structured pull requests with clear, informative descriptions in Japanese.

## Workflow

### Step 1: Check Branch State

Run the following commands to understand the current state:

```bash
git status
git log main..HEAD --oneline
git diff main...HEAD --stat
```

Verify:

- Current branch is not `main`
- There are commits to include in the PR
- No uncommitted changes (warn if any)

### Step 2: Create PR Draft

1. Read the template from [pr-template.md](pr-template.md)
2. Create directory `local/pr/` if it doesn't exist
3. Copy template to `local/pr/<timestamp>.md` where `<timestamp>` is in format `YYYYMMDD-HHMMSS`
4. Pre-fill the draft based on commit history:
   - Analyze commits to generate initial summary
   - List changed files and their purposes

### Step 3: Ask User Questions

Use `AskUserQuestion` to gather information:

1. **PR Title** (in Japanese): Suggest a title based on commits, ask user to confirm or modify
2. **Summary**: Pre-fill from commit analysis, ask user to review and add context
3. **Changes**: List detected changes, ask user to add details or corrections
4. **Related Issue**: Ask for issue number (optional, can be skipped)

### Step 4: Update PR Draft

Update `local/pr/<timestamp>.md` with user's responses:

- Fill in the summary section
- Update the changes list
- Add issue reference if provided

### Step 5: Create PR

Execute:

```bash
gh pr create --title "<title>" --body-file local/pr/<timestamp>.md
```

The PR body should be in Japanese. The title should also be in Japanese.

## Edge Cases

- **No commits**: Abort and inform user there are no commits to create a PR for
- **Uncommitted changes**: Warn user and suggest committing first
- **On main branch**: Abort and inform user to create a feature branch first
- **Existing PR**: Check with `gh pr list --head <branch>` and warn if PR already exists

## Output Format

After successful PR creation, display:

- PR URL
- PR number
- Summary of what was included
