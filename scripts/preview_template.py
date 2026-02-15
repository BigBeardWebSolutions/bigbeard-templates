#!/usr/bin/env python3
"""
Template Preview Generator

Replaces all {{PLACEHOLDER}} tokens in a template's index.html with their
default values from template-config.json, producing a rendered preview.html
that can be viewed directly in a browser.

Usage:
    python scripts/preview_template.py education/capaciti-blog-option-1
    python scripts/preview_template.py --all
    python scripts/preview_template.py --all --serve
"""
import json
import re
import sys
import argparse
import http.server
import threading
from pathlib import Path

VALID_INDUSTRIES = [
    "restaurant", "healthcare", "technology", "ecommerce", "real_estate",
    "professional_services", "creative_agency", "education", "nonprofit",
    "fitness", "hospitality", "finance", "retail", "automotive", "beauty_spa",
    "manufacturing", "energy", "marketing", "other"
]


def generate_preview(template_path: Path) -> bool:
    """Generate preview.html for a single template by replacing placeholders with defaults."""
    index_path = template_path / "index.html"
    config_path = template_path / "template-config.json"

    if not index_path.exists():
        print(f"  SKIP: No index.html in {template_path}")
        return False

    if not config_path.exists():
        print(f"  SKIP: No template-config.json in {template_path}")
        return False

    # Read template HTML
    html = index_path.read_text(encoding="utf-8")

    # Read config
    with open(config_path, encoding="utf-8") as f:
        config = json.load(f)

    placeholders = config.get("placeholders", {})

    # Replace placeholders with defaults (multiple passes for nested references)
    replacements = 0
    for _pass in range(3):
        for token, definition in placeholders.items():
            default_value = definition.get("default", "")
            if token in html:
                html = html.replace(token, default_value)
                if _pass == 0:
                    replacements += 1

    # Check for any remaining unreplaced placeholders
    remaining = re.findall(r"\{\{[A-Z_0-9]+\}\}", html)
    if remaining:
        unique_remaining = sorted(set(remaining))
        print(f"  WARNING: {len(unique_remaining)} unreplaced placeholder(s): {', '.join(unique_remaining[:5])}")

    # Write preview.html
    preview_path = template_path / "preview.html"
    preview_path.write_text(html, encoding="utf-8")

    print(f"  OK: {replacements} placeholders replaced -> {preview_path}")
    return True


def find_all_templates(base_path: Path):
    """Find all template directories."""
    templates = []
    for industry in VALID_INDUSTRIES:
        industry_path = base_path / industry
        if not industry_path.exists():
            continue
        for template_dir in sorted(industry_path.iterdir()):
            if template_dir.is_dir() and not template_dir.name.startswith("."):
                templates.append(template_dir)
    return templates


def serve_previews(base_path: Path, port: int = 8080):
    """Start a local HTTP server to browse all template previews."""
    # Generate an index page listing all templates
    templates = find_all_templates(base_path)
    index_html = build_index_page(templates, base_path)
    index_file = base_path / "_preview_index.html"
    index_file.write_text(index_html, encoding="utf-8")

    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(base_path), **kwargs)

        def log_message(self, format, *args):
            pass  # Suppress request logs

    server = http.server.HTTPServer(("localhost", port), Handler)
    print(f"\n  Serving previews at: http://localhost:{port}/_preview_index.html")
    print(f"  Press Ctrl+C to stop\n")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()
        index_file.unlink(missing_ok=True)
        print("\n  Server stopped.")


def build_index_page(templates, base_path: Path) -> str:
    """Build an HTML index page linking to all template previews."""
    cards = []
    for tpl in templates:
        rel_path = tpl.relative_to(base_path)
        preview_html = tpl / "preview.html"
        preview_img = tpl / "preview.png"
        meta_path = tpl / "metadata.json"

        name = str(rel_path)
        industry = rel_path.parts[0] if rel_path.parts else "unknown"
        description = ""
        design_style = ""

        if meta_path.exists():
            with open(meta_path) as f:
                meta = json.load(f)
            name = meta.get("name", name)
            description = meta.get("description", "")[:120]
            design_style = meta.get("design_style", "")

        has_preview = preview_html.exists()
        link = f"{rel_path}/preview.html" if has_preview else f"{rel_path}/index.html"
        img_src = f"{rel_path}/preview.png"
        status = "Ready" if has_preview else "Raw (no preview.html)"

        status_class = "status-ok" if has_preview else "status-raw"
        preview_link = '<a href="{}" target="_blank" class="link-preview">preview</a>'.format(link) if has_preview else ""

        cards.append("""
        <div class="card" data-industry="{industry}">
            <a href="{link}" target="_blank">
                <img src="{img_src}" alt="{name}" class="card-img">
            </a>
            <div class="card-body">
                <span class="badge badge-{industry}">{industry}</span>
                <span class="badge badge-style">{design_style}</span>
                <h3><a href="{link}" target="_blank">{name}</a></h3>
                <p>{description}</p>
                <div class="card-meta">
                    <span class="status {status_class}">{status}</span>
                    <a href="{rel_path}/index.html" target="_blank" class="link-raw">raw</a>
                    {preview_link}
                </div>
            </div>
        </div>""".format(
            industry=industry, link=link, img_src=img_src, name=name,
            design_style=design_style, description=description,
            status_class=status_class, status=status,
            rel_path=rel_path, preview_link=preview_link
        ))

    # Pre-compute filter buttons
    industry_counts = {}
    for t in templates:
        ind = t.relative_to(base_path).parts[0]
        industry_counts[ind] = industry_counts.get(ind, 0) + 1

    filter_buttons = []
    for ind in sorted(industry_counts.keys()):
        count = industry_counts[ind]
        btn = '<button class="filter-btn" onclick="filterCards(\'{}\')">{} ({})</button>'.format(ind, ind, count)
        filter_buttons.append(btn)

    cards_html = "\n".join(cards)
    filters_html = "\n        ".join(filter_buttons)
    total = len(templates)

    return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BigBeard Templates - Preview Gallery</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f1117; color: #e0e0e0; padding: 2rem; }
        h1 { text-align: center; margin-bottom: 0.5rem; font-size: 2rem; color: #fff; }
        .subtitle { text-align: center; color: #888; margin-bottom: 2rem; font-size: 1.1rem; }
        .filters { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem; }
        .filter-btn { padding: 0.4rem 1rem; border: 1px solid #333; border-radius: 20px; background: transparent; color: #aaa; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; }
        .filter-btn:hover, .filter-btn.active { background: #2563eb; color: #fff; border-color: #2563eb; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; max-width: 1400px; margin: 0 auto; }
        .card { background: #1a1d27; border-radius: 12px; overflow: hidden; border: 1px solid #2a2d37; transition: transform 0.2s, border-color 0.2s; }
        .card:hover { transform: translateY(-4px); border-color: #2563eb; }
        .card-img { width: 100%; height: 200px; object-fit: cover; object-position: top; display: block; }
        .card-body { padding: 1rem; }
        .card-body h3 { font-size: 1rem; margin: 0.5rem 0; }
        .card-body h3 a { color: #fff; text-decoration: none; }
        .card-body h3 a:hover { color: #60a5fa; }
        .card-body p { font-size: 0.85rem; color: #888; line-height: 1.4; margin-bottom: 0.75rem; }
        .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; }
        .badge-education { background: #1e3a5f; color: #60a5fa; }
        .badge-healthcare { background: #1a3f2f; color: #34d399; }
        .badge-technology { background: #3b1f5e; color: #a78bfa; }
        .badge-finance { background: #3f2f1a; color: #fbbf24; }
        .badge-hospitality { background: #3f1a1a; color: #f87171; }
        .badge-manufacturing { background: #1a2f3f; color: #38bdf8; }
        .badge-marketing { background: #3f1a3f; color: #f472b6; }
        .badge-nonprofit { background: #1a3f1a; color: #4ade80; }
        .badge-energy { background: #3f3f1a; color: #facc15; }
        .badge-style { background: #2a2d37; color: #aaa; margin-left: 0.3rem; }
        .card-meta { display: flex; align-items: center; gap: 0.75rem; font-size: 0.8rem; }
        .status { padding: 0.15rem 0.5rem; border-radius: 8px; font-size: 0.7rem; }
        .status-ok { background: #064e3b; color: #34d399; }
        .status-raw { background: #451a03; color: #fb923c; }
        .link-raw, .link-preview { color: #60a5fa; text-decoration: none; font-size: 0.8rem; }
        .link-raw:hover, .link-preview:hover { text-decoration: underline; }
        .stats { text-align: center; color: #666; font-size: 0.9rem; margin-bottom: 1.5rem; }
    </style>
</head>
<body>
    <h1>BigBeard Templates</h1>
    <p class="subtitle">Preview Gallery - """ + str(total) + """ Templates</p>
    <div class="filters">
        <button class="filter-btn active" onclick="filterCards('all')">All (""" + str(total) + """)</button>
        """ + filters_html + """
    </div>
    <div class="grid">
        """ + cards_html + """
    </div>
    <script>
        function filterCards(industry) {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            event.target.classList.add('active');
            document.querySelectorAll('.card').forEach(card => {
                card.style.display = (industry === 'all' || card.dataset.industry === industry) ? '' : 'none';
            });
        }
    </script>
</body>
</html>"""


def main():
    parser = argparse.ArgumentParser(description="Generate rendered previews for templates")
    parser.add_argument("template", nargs="?", help="Template path (e.g., education/capaciti-blog-option-1)")
    parser.add_argument("--all", action="store_true", help="Generate previews for all templates")
    parser.add_argument("--serve", action="store_true", help="Start local HTTP server to browse previews")
    parser.add_argument("--port", type=int, default=8080, help="Port for HTTP server (default: 8080)")

    args = parser.parse_args()

    script_dir = Path(__file__).parent
    base_path = script_dir.parent

    if not args.template and not args.all:
        parser.error("Provide a template path or use --all")

    if args.all:
        templates = find_all_templates(base_path)
        print(f"Generating previews for {len(templates)} templates...\n")

        success = 0
        for tpl in templates:
            rel = tpl.relative_to(base_path)
            print(f"[{rel}]")
            if generate_preview(tpl):
                success += 1

        print(f"\nDone: {success}/{len(templates)} previews generated")

        if args.serve:
            serve_previews(base_path, args.port)
    else:
        template_path = base_path / args.template
        if not template_path.exists():
            print(f"ERROR: Template not found: {template_path}")
            sys.exit(1)

        print(f"[{args.template}]")
        if generate_preview(template_path):
            if args.serve:
                serve_previews(base_path, args.port)
        else:
            sys.exit(1)


if __name__ == "__main__":
    main()
