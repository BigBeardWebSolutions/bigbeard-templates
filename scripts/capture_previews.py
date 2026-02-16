#!/usr/bin/env python3
"""
Capture preview.png screenshots for all templates using headless Chrome.
Requires a local HTTP server running on port 8080 serving the templates.
"""

import os
import subprocess
import time

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE_URL = "http://127.0.0.1:8080"

# All templates in order
TEMPLATES = [
    "healthcare/hasa-conference-newsletter",
    "healthcare/hasa-gala-event",
    "healthcare/hasa-main-site",
    "healthcare/hasa-nhi",
    "technology/bbws-ai-page-builder",
    "technology/chirrup",
    "education/capaciti-blog-option-1",
    "education/capaciti-blog-option-2",
    "education/capaciti-landing-page",
    "education/capaciti-phase1",
    "nonprofit/amandla-omoya-trust",
    "nonprofit/letsatsi-borutho-trust",
    "nonprofit/sibona-ilanga-trust",
    "hospitality/experience-madikwe",
    "finance/denker-website",
    "manufacturing/forgeweld",
    "manufacturing/fuse-factory",
    "energy/sosimple",
    "marketing/metis",
]


def capture_screenshot(template_path):
    """Capture a screenshot of a template's preview.html using headless Chrome."""
    url = f"{BASE_URL}/{template_path}/preview.html"
    output_path = os.path.join(REPO_ROOT, template_path, "preview.png")

    cmd = [
        CHROME,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--hide-scrollbars",
        f"--window-size=1440,900",
        f"--screenshot={output_path}",
        url,
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if os.path.exists(output_path):
            size = os.path.getsize(output_path)
            print(f"  OK: {template_path}/preview.png ({size:,} bytes)")
            return True
        else:
            print(f"  FAIL: {template_path} - no screenshot generated")
            print(f"    stderr: {result.stderr[:200]}")
            return False
    except subprocess.TimeoutExpired:
        print(f"  TIMEOUT: {template_path}")
        return False
    except Exception as e:
        print(f"  ERROR: {template_path} - {e}")
        return False


def main():
    print(f"Capturing preview screenshots for {len(TEMPLATES)} templates...")
    print(f"Chrome: {CHROME}")
    print(f"Base URL: {BASE_URL}\n")

    success = 0
    failed = 0

    for template in TEMPLATES:
        print(f"Capturing {template}...")
        if capture_screenshot(template):
            success += 1
        else:
            failed += 1

    print(f"\nDone: {success} succeeded, {failed} failed")


if __name__ == "__main__":
    main()
