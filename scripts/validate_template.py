#!/usr/bin/env python3
"""
Template Validator

Validates template structure and content before commit/sync.

Usage:
    python validate_template.py {industry}/{template-name}
    python validate_template.py --all
"""
import os
import sys
import json
import re
import argparse
from pathlib import Path
from typing import List, Dict, Any, Tuple

# Required files for each template
REQUIRED_FILES = [
    "index.html",
    "css/styles.css",
    "template-config.json",
    "metadata.json",
    "preview.png",
]

# Required placeholder tokens
REQUIRED_PLACEHOLDERS = [
    "{{BUSINESS_NAME}}",
]

# Required CSS variables
REQUIRED_CSS_VARIABLES = [
    "--primary-color",
    "--secondary-color",
    "--text-color",
    "--background-color",
]

# Valid industries
VALID_INDUSTRIES = [
    "restaurant", "healthcare", "technology", "ecommerce", "real_estate",
    "professional_services", "creative_agency", "education", "nonprofit",
    "fitness", "hospitality", "finance", "retail", "automotive", "beauty_spa",
    "manufacturing", "energy", "marketing", "other"
]

# Valid CTA intents
VALID_CTA_INTENTS = [
    "contact", "purchase", "booking", "signup", "lead_generation", "download", "learn_more"
]

# Valid design styles
VALID_DESIGN_STYLES = [
    "modern", "classic", "minimal", "bold", "elegant", "playful", "corporate", "warm",
    "modern-industrial", "dark"
]


class ValidationError:
    def __init__(self, file: str, message: str, severity: str = "error"):
        self.file = file
        self.message = message
        self.severity = severity  # error, warning, info

    def __str__(self):
        icon = "❌" if self.severity == "error" else "⚠️" if self.severity == "warning" else "ℹ️"
        return f"{icon} [{self.file}] {self.message}"


def validate_template(template_path: Path) -> Tuple[bool, List[ValidationError]]:
    """
    Validate a template directory.

    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []

    # Check if directory exists
    if not template_path.is_dir():
        errors.append(ValidationError("", f"Template directory not found: {template_path}", "error"))
        return False, errors

    # Check required files
    for required_file in REQUIRED_FILES:
        file_path = template_path / required_file
        if not file_path.exists():
            errors.append(ValidationError(required_file, f"Required file missing: {required_file}", "error"))

    # Validate index.html
    html_path = template_path / "index.html"
    if html_path.exists():
        errors.extend(validate_html(html_path))

    # Validate CSS
    css_path = template_path / "css" / "styles.css"
    if css_path.exists():
        errors.extend(validate_css(css_path))

    # Validate template-config.json
    config_path = template_path / "template-config.json"
    if config_path.exists():
        errors.extend(validate_template_config(config_path))

    # Validate metadata.json
    metadata_path = template_path / "metadata.json"
    if metadata_path.exists():
        errors.extend(validate_metadata(metadata_path))

    # Check preview image
    preview_path = template_path / "preview.png"
    if preview_path.exists():
        errors.extend(validate_preview_image(preview_path))

    # Determine if valid (no errors)
    is_valid = not any(e.severity == "error" for e in errors)

    return is_valid, errors


def validate_html(html_path: Path) -> List[ValidationError]:
    """Validate HTML file."""
    errors = []
    content = html_path.read_text()

    # Check for DOCTYPE
    if not content.strip().lower().startswith("<!doctype html"):
        errors.append(ValidationError("index.html", "Missing DOCTYPE declaration", "error"))

    # Check for required placeholder
    for placeholder in REQUIRED_PLACEHOLDERS:
        if placeholder not in content:
            errors.append(ValidationError("index.html", f"Missing required placeholder: {placeholder}", "error"))

    # Check for semantic HTML elements
    semantic_elements = ["<header", "<main", "<footer", "<section", "<nav"]
    found_semantic = sum(1 for el in semantic_elements if el in content.lower())
    if found_semantic < 3:
        errors.append(ValidationError("index.html", "Consider using more semantic HTML elements", "warning"))

    # Check for accessibility attributes
    img_without_alt = re.findall(r'<img(?![^>]*alt=)[^>]*>', content, re.IGNORECASE)
    if img_without_alt:
        errors.append(ValidationError("index.html", f"Found {len(img_without_alt)} img tags without alt attribute", "warning"))

    # Check for CSS variable usage
    css_var_count = len(re.findall(r'var\(--[a-z-]+\)', content))
    if css_var_count < 3:
        errors.append(ValidationError("index.html", "Consider using more CSS variables for theming", "warning"))

    # Check for meta viewport
    if 'viewport' not in content:
        errors.append(ValidationError("index.html", "Missing viewport meta tag", "error"))

    return errors


def validate_css(css_path: Path) -> List[ValidationError]:
    """Validate CSS file."""
    errors = []
    content = css_path.read_text()

    # Check for required CSS variables in :root
    for var in REQUIRED_CSS_VARIABLES:
        if var not in content:
            errors.append(ValidationError("css/styles.css", f"Missing required CSS variable: {var}", "error"))

    # Check for :root selector
    if ":root" not in content:
        errors.append(ValidationError("css/styles.css", "Missing :root selector for CSS variables", "error"))

    # Check for media queries (responsive design)
    media_queries = re.findall(r'@media', content)
    if len(media_queries) < 2:
        errors.append(ValidationError("css/styles.css", "Consider adding more responsive breakpoints", "warning"))

    # Check file size
    if len(content) < 500:
        errors.append(ValidationError("css/styles.css", "CSS file seems too small, may be incomplete", "warning"))

    return errors


def validate_template_config(config_path: Path) -> List[ValidationError]:
    """Validate template-config.json."""
    errors = []

    try:
        content = json.loads(config_path.read_text())
    except json.JSONDecodeError as e:
        errors.append(ValidationError("template-config.json", f"Invalid JSON: {e}", "error"))
        return errors

    # Check required fields
    required_fields = ["template_id", "name"]
    for field in required_fields:
        if field not in content:
            errors.append(ValidationError("template-config.json", f"Missing required field: {field}", "error"))

    # Check template_id format
    template_id = content.get("template_id", "")
    if template_id and not re.match(r'^[a-z0-9-]+$', template_id):
        errors.append(ValidationError("template-config.json", "template_id must be lowercase alphanumeric with dashes", "error"))

    # Check placeholders
    if "placeholders" in content:
        for placeholder in content["placeholders"]:
            if not placeholder.startswith("{{") or not placeholder.endswith("}}"):
                errors.append(ValidationError("template-config.json", f"Invalid placeholder format: {placeholder}", "warning"))

    return errors


def validate_metadata(metadata_path: Path) -> List[ValidationError]:
    """Validate metadata.json."""
    errors = []

    try:
        content = json.loads(metadata_path.read_text())
    except json.JSONDecodeError as e:
        errors.append(ValidationError("metadata.json", f"Invalid JSON: {e}", "error"))
        return errors

    # Check required fields
    required_fields = ["template_id", "name", "industry", "cta_intent", "design_style"]
    for field in required_fields:
        if field not in content:
            errors.append(ValidationError("metadata.json", f"Missing required field: {field}", "error"))

    # Validate industry
    industry = content.get("industry", "")
    if industry and industry not in VALID_INDUSTRIES:
        errors.append(ValidationError("metadata.json", f"Invalid industry: {industry}", "error"))

    # Validate CTA intent
    cta_intent = content.get("cta_intent", "")
    if cta_intent and cta_intent not in VALID_CTA_INTENTS:
        errors.append(ValidationError("metadata.json", f"Invalid cta_intent: {cta_intent}", "error"))

    # Validate design style
    design_style = content.get("design_style", "")
    if design_style and design_style not in VALID_DESIGN_STYLES:
        errors.append(ValidationError("metadata.json", f"Invalid design_style: {design_style}", "error"))

    # Check for description (important for RAG)
    if not content.get("description"):
        errors.append(ValidationError("metadata.json", "Missing description field (important for RAG matching)", "warning"))

    # Check for keywords
    if not content.get("keywords"):
        errors.append(ValidationError("metadata.json", "Consider adding keywords for better search matching", "warning"))

    return errors


def validate_preview_image(preview_path: Path) -> List[ValidationError]:
    """Validate preview image."""
    errors = []

    # Check file size (should be < 500KB)
    file_size = preview_path.stat().st_size
    if file_size > 500 * 1024:
        errors.append(ValidationError("preview.png", f"Preview image too large: {file_size // 1024}KB (max 500KB)", "warning"))

    # Note: For full image dimension validation, you'd need PIL/Pillow
    # This is a basic check

    return errors


def find_all_templates(base_path: Path) -> List[Path]:
    """Find all template directories."""
    templates = []

    for industry_dir in base_path.iterdir():
        if industry_dir.is_dir() and industry_dir.name in VALID_INDUSTRIES:
            for template_dir in industry_dir.iterdir():
                if template_dir.is_dir() and not template_dir.name.startswith('.'):
                    templates.append(template_dir)

    return templates


def main():
    parser = argparse.ArgumentParser(description="Validate BigBeard templates")
    parser.add_argument("template", nargs="?", help="Template path (e.g., restaurant/modern-bistro)")
    parser.add_argument("--all", action="store_true", help="Validate all templates")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show all messages including info")

    args = parser.parse_args()

    # Determine base path (repository root)
    script_dir = Path(__file__).parent
    base_path = script_dir.parent

    if args.all:
        templates = find_all_templates(base_path)
        if not templates:
            print("No templates found to validate")
            sys.exit(0)
    elif args.template:
        template_path = base_path / args.template
        templates = [template_path]
    else:
        parser.print_help()
        sys.exit(1)

    # Validate templates
    all_valid = True
    total_errors = 0
    total_warnings = 0

    for template_path in templates:
        print(f"\n{'='*60}")
        print(f"Validating: {template_path.relative_to(base_path)}")
        print('='*60)

        is_valid, errors = validate_template(template_path)

        if not is_valid:
            all_valid = False

        for error in errors:
            if error.severity == "info" and not args.verbose:
                continue
            print(error)
            if error.severity == "error":
                total_errors += 1
            elif error.severity == "warning":
                total_warnings += 1

        status = "✅ VALID" if is_valid else "❌ INVALID"
        print(f"\nStatus: {status}")

    # Summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print('='*60)
    print(f"Templates validated: {len(templates)}")
    print(f"Total errors: {total_errors}")
    print(f"Total warnings: {total_warnings}")
    print(f"Overall: {'✅ ALL VALID' if all_valid else '❌ SOME INVALID'}")

    sys.exit(0 if all_valid else 1)


if __name__ == "__main__":
    main()
