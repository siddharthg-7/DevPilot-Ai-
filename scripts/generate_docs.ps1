$docs = @(
    @{ Path = "CHANGELOG.md"; Content = "# Changelog`n`nAll notable changes to this project will be documented in this file.`n`nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)." },
    @{ Path = "ROADMAP.md"; Content = "# Roadmap`n`nOur vision for the future of DevPilot AI.`n`n## Q3 2026`n- Multimodal Vision Support`n- Voice interface`n`n## Q4 2026`n- Team collaboration features`n- Enterprise SSO integration" },
    @{ Path = "SECURITY.md"; Content = "# Security Policy`n`n## Supported Versions`n`n| Version | Supported          |`n| ------- | ------------------ |`n| 1.0.x   | :white_check_mark: |`n`n## Reporting a Vulnerability`n`nPlease report vulnerabilities to security@devpilot.ai." },
    @{ Path = "CONTRIBUTING.md"; Content = "# Contributing to DevPilot AI`n`nFirst off, thank you for considering contributing to DevPilot AI! It's people like you that make it a great tool.`n`n## Development Setup`n1. Fork and clone the repo`n2. Run `npm install``n3. Run `npm run dev``n`n## Pull Request Process`n1. Ensure tests pass`n2. Update documentation`n3. Request review" },
    @{ Path = "CODE_OF_CONDUCT.md"; Content = "# Contributor Covenant Code of Conduct`n`n## Our Pledge`n`nWe as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone." },
    @{ Path = "ARCHITECTURE.md"; Content = "# System Architecture`n`nDevPilot AI uses a decoupled client-server architecture with multi-agent orchestration for its core features.`n`nSee `docs/architecture/` for detailed flow diagrams." },
    @{ Path = "API_REFERENCE.md"; Content = "# API Reference`n`nDevPilot AI provides a RESTful API for interacting with the agent runtime.`n`n## Endpoints`n`n- `GET /api/agents` - List available agents`n- `POST /api/chat` - Send a message to an agent" },
    @{ Path = "DEPLOYMENT.md"; Content = "# Deployment Guide`n`n## Docker`nUse the provided `docker-compose.yml` to spin up the full stack locally.`n`n## Cloud Providers`nDevPilot AI can be deployed on Vercel, Render, or any standard Node.js hosting platform." },
    @{ Path = "LICENSE"; Content = "MIT License`n`nCopyright (c) 2026 DevPilot AI`n`nPermission is hereby granted, free of charge, to any person obtaining a copy..." },
    @{ Path = "docker-compose.yml"; Content = "version: '3.8'`nservices:`n  app:`n    build: .`n    ports:`n      - '3000:3000'`n    environment:`n      - GEMINI_API_KEY=${GEMINI_API_KEY}`n      - DATABASE_URL=sqlite://database.db" },
    
    @{ Path = ".github/PULL_REQUEST_TEMPLATE.md"; Content = "## Description`n`nPlease include a summary of the change and which issue is fixed.`n`nFixes # (issue)`n`n## Type of change`n- [ ] Bug fix`n- [ ] New feature" },
    @{ Path = ".github/CODE_OF_CONDUCT.md"; Content = "Please refer to the CODE_OF_CONDUCT.md at the root of the repository." },
    @{ Path = ".github/CONTRIBUTING.md"; Content = "Please refer to the CONTRIBUTING.md at the root of the repository." },
    @{ Path = ".github/ISSUE_TEMPLATE/bug_report.md"; Content = "---`nname: Bug report`nabout: Create a report to help us improve`ntitle: ''`nlabels: bug`nassignees: ''`n---`n`n**Describe the bug**`n" },
    @{ Path = ".github/ISSUE_TEMPLATE/feature_request.md"; Content = "---`nname: Feature request`nabout: Suggest an idea for this project`ntitle: ''`nlabels: enhancement`nassignees: ''`n---`n`n**Is your feature request related to a problem? Please describe.**`n" },
    
    @{ Path = ".github/workflows/ci.yml"; Content = "name: CI`non: [push, pull_request]`njobs:`n  build:`n    runs-on: ubuntu-latest`n    steps:`n      - uses: actions/checkout@v3`n      - uses: actions/setup-node@v3`n        with:`n          node-version: 18`n      - run: npm ci`n      - run: npm run build`n      - run: npm test" },
    @{ Path = ".github/workflows/lint.yml"; Content = "name: Lint`non: [push, pull_request]`njobs:`n  lint:`n    runs-on: ubuntu-latest`n    steps:`n      - uses: actions/checkout@v3`n      - uses: actions/setup-node@v3`n        with:`n          node-version: 18`n      - run: npm ci`n      - run: npm run lint" },
    
    @{ Path = "docs/architecture/system-architecture.md"; Content = "# System Architecture`n`nDetails on how the Node.js backend connects to the React frontend and handles the SQLite db." },
    @{ Path = "docs/architecture/agent-architecture.md"; Content = "# Agent Architecture`n`nExplains the CascadeFlow runtime and multi-agent system." },
    @{ Path = "docs/architecture/memory-flow.md"; Content = "# Memory Flow`n`nExplains how Hindsight is used for persistent memory across conversations." },
    @{ Path = "docs/architecture/runtime-flow.md"; Content = "# Runtime Flow`n`nDetails on model routing, budget control, and execution audits." },
    @{ Path = "docs/architecture/database-schema.md"; Content = "# Database Schema`n`nSchema diagrams and explanations for tables in SQLite." }
)

foreach ($doc in $docs) {
    Set-Content -Path $doc.Path -Value $doc.Content
}
