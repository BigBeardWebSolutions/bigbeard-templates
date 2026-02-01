# BigBeard Templates Repository

This repository contains HTML templates for the BigBeard Website Builder. Templates are extracted from Figma designs and optimized for AI-powered customization.

## Repository Structure

```
bigbeard-templates/
├── README.md                           # This file
├── metadata.json                       # Master template index
├── scripts/
│   ├── validate_template.py           # Validate template structure
│   ├── generate_embeddings.py         # Create vector embeddings
│   └── sync_check.py                  # Pre-sync validation
├── restaurant/
│   └── {template-name}/
│       ├── index.html                 # Main HTML template
│       ├── css/styles.css            # Stylesheet with CSS variables
│       ├── js/main.js                # Optional JavaScript
│       ├── images/                    # Template images
│       ├── template-config.json       # Customization configuration
│       ├── metadata.json              # RAG indexing metadata
│       └── preview.png                # Template preview image
├── healthcare/
├── technology/
├── ecommerce/
├── professional_services/
├── creative_agency/
├── education/
├── nonprofit/
├── fitness/
├── hospitality/
├── finance/
├── retail/
└── .github/workflows/
    └── sync-to-s3.yml                 # Auto-sync to S3 on push
```

## Template Structure

Each template must include:

### Required Files
- `index.html` - Main HTML file with placeholder tokens
- `css/styles.css` - Stylesheet using CSS custom properties
- `template-config.json` - Configuration for customization
- `metadata.json` - Metadata for RAG template matching
- `preview.png` - 1200x630px preview image

### Optional Files
- `js/main.js` - Interactive JavaScript
- `images/` - Default/placeholder images

## Placeholder Tokens

Templates use double-brace placeholders for content replacement:

| Token | Description | Example |
|-------|-------------|---------|
| `{{BUSINESS_NAME}}` | Company/business name | "Golden Crust Bakery" |
| `{{TAGLINE}}` | Business tagline | "Fresh Baked Daily" |
| `{{HERO_HEADLINE}}` | Main hero headline | "Welcome to the Best Bakery" |
| `{{HERO_DESCRIPTION}}` | Hero section description | "Artisan breads and pastries..." |
| `{{PRIMARY_CTA}}` | Primary call-to-action | "Order Now" |
| `{{SECONDARY_CTA}}` | Secondary CTA | "View Menu" |
| `{{PHONE}}` | Contact phone | "+1 (555) 123-4567" |
| `{{EMAIL}}` | Contact email | "info@business.com" |
| `{{ADDRESS}}` | Business address | "123 Main St, City, ST 12345" |
| `{{YEAR}}` | Copyright year | "2026" |

## CSS Variables

Templates must use CSS custom properties for theming:

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

## Adding a New Template

1. **Create directory structure**:
   ```bash
   mkdir -p {industry}/{template-name}
   ```

2. **Add template files**:
   - Create `index.html` with placeholder tokens
   - Create `css/styles.css` with CSS variables
   - Create `template-config.json` (see schema)
   - Create `metadata.json` (see schema)
   - Add `preview.png` (1200x630px)

3. **Validate**:
   ```bash
   python scripts/validate_template.py {industry}/{template-name}
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "Add {template-name} template for {industry}"
   git push origin main
   ```

5. **Automatic sync**:
   - GitHub Actions automatically syncs to S3 on push to main
   - Embeddings are regenerated for RAG matching

## Validation

Run validation before committing:

```bash
# Validate single template
python scripts/validate_template.py restaurant/modern-bistro

# Validate all templates
python scripts/validate_template.py --all

# Check S3 sync readiness
python scripts/sync_check.py
```

## Environments

| Environment | S3 Bucket | Branch |
|-------------|-----------|--------|
| DEV | `bbws-templates-dev` | `develop` |
| SIT | `bbws-templates-sit` | `staging` |
| PROD | `bbws-templates-prod` | `main` |

## Schema References

- [template-config.schema.json](../api/figma_extractor_service/schemas/template-config.schema.json)
- [metadata.schema.json](../api/figma_extractor_service/schemas/metadata.schema.json)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add/modify templates
4. Run validation
5. Submit a pull request

## License

Proprietary - BigBeard Technologies
