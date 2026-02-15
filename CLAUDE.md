# BigBeard Templates - Project Instructions

## Project Purpose

Template repository for the BigBeard Website Builder. Contains white-label HTML website templates across multiple industries, extracted from Figma designs and optimized for AI-powered customization via the Design-to-Deployment pipeline.

## Repository Overview

- **19 templates** across **9 industries** (education, energy, finance, healthcare, hospitality, manufacturing, marketing, nonprofit, technology)
- Templates use **CSS variables** for theming and **placeholder tokens** (`{{BUSINESS_NAME}}`, `{{TAGLINE}}`, etc.) for content replacement
- Includes validation scripts, embedding generation, and GitHub Actions for S3 sync
- Preview gallery: `_preview_index.html`

## Template Structure (Per Template)

```
{industry}/{template-name}/
├── index.html              # Main HTML with placeholder tokens
├── css/styles.css          # Stylesheet with CSS custom properties
├── js/main.js              # Optional interactive JavaScript
├── images/                 # Template images
├── template-config.json    # Customization configuration
├── metadata.json           # RAG indexing metadata
└── preview.png             # 1200x630px preview image
```

## Environments

| Environment | S3 Bucket | Branch | AWS Account | Region | Profile |
|-------------|-----------|--------|-------------|--------|---------|
| DEV | `bbws-templates-dev` | `develop` | 536580886816 | eu-west-1 | Tebogo-dev |
| SIT | `bbws-templates-sit` | `staging` | 815856636111 | eu-west-1 | Tebogo-sit |
| PROD | `bbws-templates-prod` | `main` | 093646564004 | af-south-1 | Tebogo-prod |

## Critical Rules

- **NEVER** hardcode bucket names, account IDs, or credentials
- **NEVER** include proprietary data in templates (logos, brand text, analytics)
- **NEVER** allow public access on S3 buckets
- **ALWAYS** validate templates before committing (`python scripts/validate_template.py`)
- **ALWAYS** generate embeddings after adding/modifying templates
- **ALWAYS** strip proprietary data — templates must be white-label
- **ALWAYS** use CSS variables for theming (no hardcoded colors/fonts)
- **ALWAYS** use placeholder tokens for content (no hardcoded business info)
- **ALWAYS** follow DEV → SIT → PROD promotion path

## Placeholder Tokens

| Token | Description |
|-------|-------------|
| `{{BUSINESS_NAME}}` | Company/business name |
| `{{TAGLINE}}` | Business tagline |
| `{{HERO_HEADLINE}}` | Main hero headline |
| `{{HERO_DESCRIPTION}}` | Hero section description |
| `{{PRIMARY_CTA}}` | Primary call-to-action text |
| `{{SECONDARY_CTA}}` | Secondary CTA text |
| `{{PHONE}}` | Contact phone |
| `{{EMAIL}}` | Contact email |
| `{{ADDRESS}}` | Business address |
| `{{YEAR}}` | Copyright year |

## CSS Variables Standard

All templates must use these CSS custom properties:

```css
:root {
    --primary-color: #2563EB;
    --secondary-color: #1E40AF;
    --accent-color: #F59E0B;
    --background-color: #FFFFFF;
    --surface-color: #F3F4F6;
    --text-color: #1F2937;
    --text-secondary: #6B7280;
    --heading-font: 'Inter', sans-serif;
    --body-font: 'Inter', sans-serif;
    --border-radius: 8px;
    --spacing-unit: 8px;
}
```

## Workflow

1. Extract design tokens from Figma (Stage 1 of pipeline)
2. Convert to clean HTML template with proprietary data stripped (Stage 2)
3. Validate template structure: `python scripts/validate_template.py {industry}/{template}`
4. Generate embeddings: `python scripts/generate_embeddings.py`
5. Update `metadata.json` with new template entry
6. Commit and push — GitHub Actions syncs to S3

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/validate_template.py` | Validate template structure and required files |
| `scripts/generate_embeddings.py` | Create vector embeddings for RAG template matching |
| `scripts/process_existing_templates.py` | Batch process existing templates |
| `scripts/preview_template.py` | Generate preview gallery |

## TBT Mechanism

- **Logs**: `docs/logs/` — Session history and change logs
- **Plans**: `docs/plans/` — Implementation plans before execution
- **Screenshots**: `docs/screenshots/` — Visual verification evidence

## Related Repositories

| Repository | Purpose |
|------------|---------|
| `3_web_developer_agent` | Web Developer Agent with pipeline skills |
| `3_bbws-site-builder` | Site Builder frontend and services |
| `2_bbws_agents` | Agent definitions and skills |

## Root Workflow Inheritance

{{include:../CLAUDE.md}}
