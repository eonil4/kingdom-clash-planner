# GitHub Setup Instructions

This guide will help you push your Kingdom Clash Planner project to GitHub.

## Prerequisites

- Git installed and configured
- GitHub account
- GitHub CLI (`gh`) installed (optional, but recommended) OR access to GitHub website

## Method 1: Using GitHub CLI (Recommended)

If you have GitHub CLI installed:

```bash
# Authenticate with GitHub (if not already done)
gh auth login

# Create a new repository on GitHub and push your code
gh repo create kingdom-clash-planner --public --source=. --remote=origin --push
```

If you want a private repository:
```bash
gh repo create kingdom-clash-planner --private --source=. --remote=origin --push
```

## Method 2: Manual Setup (Using GitHub Website)

### Step 1: Create Repository on GitHub

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **+** icon in the top right corner
3. Select **New repository**
4. Fill in the details:
   - **Repository name**: `kingdom-clash-planner` (or your preferred name)
   - **Description**: (optional) "Formation planner for Kingdom Clash game"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **Create repository**

### Step 2: Add Remote and Push

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/kingdom-clash-planner.git

# Verify the remote was added
git remote -v

# Push your code to GitHub
git branch -M main
git push -u origin main
```

**Note**: If you used a different repository name, replace `kingdom-clash-planner` with your repository name.

## Method 3: Using SSH (If you have SSH keys set up)

If you prefer using SSH instead of HTTPS:

```bash
# Add the remote repository using SSH (replace YOUR_USERNAME with your GitHub username)
git remote add origin git@github.com:YOUR_USERNAME/kingdom-clash-planner.git

# Verify the remote was added
git remote -v

# Push your code to GitHub
git branch -M main
git push -u origin main
```

## Troubleshooting

### If you get "remote origin already exists" error:

```bash
# Remove the existing remote
git remote remove origin

# Then add it again with the correct URL
git remote add origin https://github.com/YOUR_USERNAME/kingdom-clash-planner.git
```

### If you need to change the remote URL:

```bash
# Set a new URL for the remote
git remote set-url origin https://github.com/YOUR_USERNAME/kingdom-clash-planner.git
```

### If you get authentication errors:

1. **For HTTPS**: You may need to use a Personal Access Token instead of your password
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate a new token with `repo` scope
   - Use this token as your password when pushing

2. **For SSH**: Make sure your SSH key is added to your GitHub account
   - Check: `ssh -T git@github.com`
   - If it doesn't work, follow GitHub's SSH setup guide

### If you want to rename your branch to main:

```bash
# Rename current branch to main
git branch -M main

# Push to main branch
git push -u origin main
```

## Verify Your Push

After pushing, you can verify by:

1. Visiting your repository on GitHub: `https://github.com/YOUR_USERNAME/kingdom-clash-planner`
2. You should see all your files there

## Next Steps

After successfully pushing to GitHub:

1. **Add a README** (if you want to enhance it):
   ```bash
   # Edit README.md with project description, setup instructions, etc.
   git add README.md
   git commit -m "Update README with project details"
   git push
   ```

2. **Add topics/tags** on GitHub website for better discoverability

3. **Set up GitHub Actions** for CI/CD (if needed)

4. **Add collaborators** (if working with a team)

## Quick Reference

```bash
# Check current remotes
git remote -v

# Check current branch
git branch

# View commit history
git log --oneline

# Check status
git status
```

