#!/usr/bin/env python3
"""
Clean template-config.json files by replacing proprietary default values
with generic placeholder text. Also regenerates preview.html from index.html.
"""

import os
import re
import json
import copy

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---- Proprietary strings to detect and replace ----

# Company/brand names that are proprietary
PROPRIETARY_NAMES = [
    "HASA", "Capaciti", "Chirrup", "Chirrup.ai", "Denker", "Denker Capital",
    "ForgeWeld", "Forgeweld", "Fuse Factory", "Metis", "SoSimple",
    "Experience Madikwe", "Madikwe", "BBWS", "BigBeard",
    "Amandla Omoya", "Sibona Ilanga", "Letsatsi Borutho",
    "Piet Pompies", "AI Page Builder",
    "INHOUSE CONFERENCE SOLUTIONS", "Inhouse Conference Solutions",
    "Agri-EPI Center", "Agri-EPI",
]

# Real person names to replace
PROPRIETARY_PERSONS = [
    "Ross Robertson", "Sarah Mitchell", "Candice Christians",
    "Riaad Moosa",
]

# Real email patterns
PROPRIETARY_EMAILS = [
    r'[\w.+-]+@conferencehasa\.co\.za',
    r'[\w.+-]+@hasa\.co\.za',
    r'[\w.+-]+@experiencemadikwe\.co\.za',
    r'[\w.+-]+@capaciti\.co\.za',
    r'[\w.+-]+@denkercapital\.com',
    r'[\w.+-]+@forgeweld\.co\.za',
    r'[\w.+-]+@fusefactory\.co\.za',
    r'[\w.+-]+@metismarketing\.co\.za',
    r'[\w.+-]+@sosimple\.co\.za',
    r'[\w.+-]+@chirrup\.ai',
    r'[\w.+-]+@communitytrust\.org',
    r'[\w.+-]+@pietpompies\.co\.za',
]

# Real SA phone numbers
PROPRIETARY_PHONES = [
    r'\+27\s*\(0\)\s*\d{2}\s*\d{3}\s*\d{4}',
    r'\+27\s*\d{2}\s*\d{3}\s*\d{4}',
    r'0\d{2}\s*\d{3}\s*\d{4}',
]

# Real SA addresses
PROPRIETARY_ADDRESSES = [
    "Sandton Convention Centre",
    "Johannesburg",
    "Cape Town",
    "Pretoria",
    "Gauteng",
]

# ---- Generic replacement values ----

GENERIC_REPLACEMENTS = {
    # Contact info
    "email": "info@example.com",
    "phone": "+1 (555) 000-0000",
    "address": "123 Main Street, Anytown, ST 12345",

    # Business identity
    "business_name": "Your Company Name",
    "tagline": "Your Tagline Goes Here",
    "conference_name": "ANNUAL CONFERENCE 2026 - INNOVATION TOGETHER",
    "event_name": "Gala Awards Evening",

    # People
    "person_names": ["Jane Doe", "John Smith", "Alex Johnson", "Sam Williams",
                     "Jordan Lee", "Taylor Brown"],

    # Testimonials
    "testimonial_highlight": "An excellent experience from start to finish.",
    "testimonial_body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
    "testimonial_role": "Director of Operations",

    # Descriptions
    "hero_description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Transform your vision into reality with our innovative solutions.",
    "meta_description": "Welcome to our business. We provide innovative solutions tailored to your needs.",
    "footer_description": "We provide innovative solutions to help businesses grow and succeed. Contact us to learn more about our services.",

    # News/articles
    "news_title": "Exciting updates and developments from our team",
    "news_excerpt": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "news_date": "1 JANUARY 2026 | NEWS",

    # Stats
    "stat_values": ["100+", "50+", "4.5/5", "10K+"],

    # Events
    "event_date": "Coming Soon",
    "event_venue": "Conference Center, City",
    "event_time": "18:00 for 18:30",
    "dress_code": "Formal Attire",

    # Org info
    "secretariat_name": "Event Coordinator",
    "secretariat_company": "EVENT MANAGEMENT COMPANY",
    "copyright": "Copyright (c) Your Company 2026. All Rights Reserved",
    "legal_info": "Company Ltd is a registered company",
}


def clean_string_value(value, placeholder_key=""):
    """Clean a single string value of proprietary content."""
    if not isinstance(value, str):
        return value

    original = value

    # Replace proprietary email addresses
    for pattern in PROPRIETARY_EMAILS:
        value = re.sub(pattern, GENERIC_REPLACEMENTS["email"], value, flags=re.IGNORECASE)

    # Replace proprietary phone numbers
    for pattern in PROPRIETARY_PHONES:
        value = re.sub(pattern, GENERIC_REPLACEMENTS["phone"], value)

    # Replace proprietary company/brand names
    for name in PROPRIETARY_NAMES:
        if name.lower() in value.lower():
            # Context-aware replacement
            value = re.sub(re.escape(name), GENERIC_REPLACEMENTS["business_name"],
                          value, flags=re.IGNORECASE)

    # Replace proprietary person names
    for i, name in enumerate(PROPRIETARY_PERSONS):
        if name in value:
            replacement = GENERIC_REPLACEMENTS["person_names"][i % len(GENERIC_REPLACEMENTS["person_names"])]
            value = value.replace(name, replacement)

    # Replace SA addresses
    for addr in PROPRIETARY_ADDRESSES:
        if addr in value:
            value = value.replace(addr, "Anytown")

    return value


def clean_placeholder_defaults(config):
    """Clean the defaults in a template-config.json placeholders section."""
    if "placeholders" not in config:
        return config

    cleaned = copy.deepcopy(config)

    for key, pdata in cleaned["placeholders"].items():
        if "default" not in pdata:
            continue

        default = pdata["default"]
        key_lower = key.lower()

        # Special handling for known placeholder types
        if "email" in key_lower and "@" in str(default):
            pdata["default"] = GENERIC_REPLACEMENTS["email"]
        elif "phone" in key_lower:
            pdata["default"] = GENERIC_REPLACEMENTS["phone"]
        elif "business_name" in key_lower or key == "{{BUSINESS_NAME}}":
            pdata["default"] = GENERIC_REPLACEMENTS["business_name"]
        elif "conference_name" in key_lower:
            pdata["default"] = GENERIC_REPLACEMENTS["conference_name"]
        elif "secretariat_name" in key_lower:
            pdata["default"] = GENERIC_REPLACEMENTS["secretariat_name"]
        elif "secretariat_company" in key_lower:
            pdata["default"] = GENERIC_REPLACEMENTS["secretariat_company"]
        elif "secretariat_phone" in key_lower:
            pdata["default"] = GENERIC_REPLACEMENTS["phone"]
        elif "secretariat_email" in key_lower:
            pdata["default"] = GENERIC_REPLACEMENTS["email"]
        elif "conference_venue" in key_lower or "venue_name" in key_lower:
            pdata["default"] = GENERIC_REPLACEMENTS["event_venue"]
        elif "conference_date" in key_lower or "event_date" in key_lower:
            pdata["default"] = GENERIC_REPLACEMENTS["event_date"]
        elif "event_time" in key_lower:
            pdata["default"] = GENERIC_REPLACEMENTS["event_time"]
        elif "dress_code" in key_lower:
            pdata["default"] = GENERIC_REPLACEMENTS["dress_code"]
        elif "event_host" in key_lower:
            pdata["default"] = "Guest Speaker"
        elif "hero_subtitle" in key_lower and any(n in str(default) for n in PROPRIETARY_PERSONS):
            pdata["default"] = "With Guest Speaker"
        elif "copyright" in key_lower or "footer_copyright" in key_lower:
            pdata["default"] = GENERIC_REPLACEMENTS["copyright"]
        elif "legal_info" in key_lower or "footer_legal_info" in key_lower:
            pdata["default"] = GENERIC_REPLACEMENTS["legal_info"]
        elif "testimonial" in key_lower and "author" in key_lower:
            idx = 0
            for ch in key:
                if ch.isdigit():
                    idx = int(ch) - 1
                    break
            pdata["default"] = GENERIC_REPLACEMENTS["person_names"][idx % len(GENERIC_REPLACEMENTS["person_names"])]
        elif "testimonial" in key_lower and "role" in key_lower:
            pdata["default"] = GENERIC_REPLACEMENTS["testimonial_role"]
        elif "testimonial" in key_lower and "highlight" in key_lower:
            pdata["default"] = GENERIC_REPLACEMENTS["testimonial_highlight"]
        elif "testimonial" in key_lower and "body" in key_lower:
            pdata["default"] = GENERIC_REPLACEMENTS["testimonial_body"]
        else:
            # General cleaning for any remaining proprietary content
            pdata["default"] = clean_string_value(str(default), key)

    # Clean the template name field
    if "name" in cleaned:
        cleaned["name"] = clean_string_value(cleaned["name"])

    return cleaned


def clean_config_file(config_path):
    """Clean a single template-config.json file."""
    with open(config_path, 'r') as f:
        config = json.load(f)

    cleaned = clean_placeholder_defaults(config)

    with open(config_path, 'w') as f:
        json.dump(cleaned, f, indent=2, ensure_ascii=False)
        f.write('\n')

    return cleaned


def regenerate_preview(template_dir):
    """Regenerate preview.html from index.html using cleaned config defaults."""
    index_path = os.path.join(template_dir, "index.html")
    preview_path = os.path.join(template_dir, "preview.html")
    config_path = os.path.join(template_dir, "template-config.json")

    if not os.path.exists(index_path):
        print(f"  No index.html found in {template_dir}")
        return

    # Read index.html
    with open(index_path, 'r') as f:
        content = f.read()

    # Read config for defaults
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            config = json.load(f)

        # Replace all {{PLACEHOLDER}} tokens with defaults
        if "placeholders" in config:
            for key, pdata in config["placeholders"].items():
                if "default" in pdata:
                    content = content.replace(key, str(pdata["default"]))

    # Write preview.html
    with open(preview_path, 'w') as f:
        f.write(content)

    return True


def clean_metadata(metadata_path):
    """Clean a metadata.json file of proprietary references."""
    if not os.path.exists(metadata_path):
        return

    with open(metadata_path, 'r') as f:
        metadata = json.load(f)

    def clean_value(obj):
        if isinstance(obj, str):
            return clean_string_value(obj)
        elif isinstance(obj, dict):
            return {k: clean_value(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [clean_value(item) for item in obj]
        return obj

    cleaned = clean_value(metadata)

    with open(metadata_path, 'w') as f:
        json.dump(cleaned, f, indent=2, ensure_ascii=False)
        f.write('\n')


def process_template(category, template_name):
    """Clean config and regenerate preview for one template."""
    template_dir = os.path.join(REPO_ROOT, category, template_name)

    # Step 1: Clean template-config.json
    config_path = os.path.join(template_dir, "template-config.json")
    if os.path.exists(config_path):
        clean_config_file(config_path)
        print(f"  Cleaned template-config.json")

    # Step 2: Regenerate preview.html
    if regenerate_preview(template_dir):
        print(f"  Regenerated preview.html")

    # Step 3: Clean metadata.json
    metadata_path = os.path.join(template_dir, "metadata.json")
    if os.path.exists(metadata_path):
        clean_metadata(metadata_path)
        print(f"  Cleaned metadata.json")


def process_all():
    """Process all templates."""
    categories = ['education', 'energy', 'finance', 'healthcare',
                  'hospitality', 'manufacturing', 'marketing',
                  'nonprofit', 'technology']

    for category in categories:
        cat_dir = os.path.join(REPO_ROOT, category)
        if not os.path.isdir(cat_dir):
            continue

        templates = sorted([d for d in os.listdir(cat_dir)
                          if os.path.isdir(os.path.join(cat_dir, d))])

        for template in templates:
            print(f"\n=== Cleaning {category}/{template} ===")
            process_template(category, template)

    # Clean root metadata.json
    root_metadata = os.path.join(REPO_ROOT, "metadata.json")
    if os.path.exists(root_metadata):
        clean_metadata(root_metadata)
        print(f"\n=== Cleaned root metadata.json ===")


if __name__ == "__main__":
    process_all()
    print("\n✓ All configs cleaned and previews regenerated.")
