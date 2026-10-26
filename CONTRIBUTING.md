# Contributing to RepoPilot

Thank you for your interest in contributing to RepoPilot! As an open-source tool dedicated to elevating the standard of open-source contributions, we practice what we preach.

---

## 1. Ground Rules & Code of Conduct
- Be respectful, constructive, and collaborative.
- Adhere to our security guidelines: never commit API keys, tokens, or private configurations.
- Verify that every proposed change includes unit tests and passes `npm test`, `npm run lint`, and `npm run build`.

---

## 2. Commit Message Style
RepoPilot uses **Conventional Commits**:
- `feat: <description>` - A new user-facing feature
- `fix: <description>` - A bug fix
- `security: <description>` - A security hardening patch or vulnerability mitigation
- `docs: <description>` - Documentation updates
- `chore: <description>` - Build configuration, dependencies, or maintenance

Example:
```bash
git commit -m "feat(verifier): add check for branch protection rules"
```

---

## 3. Local Development Setup

1. **Clone personal fork**:
   ```bash
   git clone https://github.com/<YOUR_USERNAME>/repopilot.git
   cd repopilot
   ```

2. **Install dependencies**:
   ```bash
   npm ci
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Add your GEMINI_API_KEY and optional GITHUB_TOKEN in .env.local
   ```

4. **Run dev server**:
   ```bash
   npm run dev
   ```

5. **Run test suite**:
   ```bash
   npm test
   ```

6. **Run linter & audit**:
   ```bash
   npm run lint
   npm audit
   ```

---

## 4. Pull Request Checklist
- [ ] Created a descriptive branch off `main` (e.g. `feat/new-ecosystem-support`)
- [ ] Added unit or integration tests in `src/__tests__/`
- [ ] Ran `npm test`, `npm run lint`, and `npm run build` locally
- [ ] Followed Conventional Commits convention
- [ ] Confirmed zero secrets or `.env` files are staged
