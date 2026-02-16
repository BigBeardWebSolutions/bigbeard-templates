#!/usr/bin/env python3
"""
Generate placeholder images to replace proprietary content in BigBeard templates.
Uses Pillow for raster images and writes SVG directly for logos/icons.
"""

import os
import json
from PIL import Image, ImageDraw, ImageFont

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Category color schemes (primary, secondary) for gradients
CATEGORY_COLORS = {
    "education": ("#4A6FA5", "#9B59B6"),    # Blue-purple
    "energy": ("#27AE60", "#F1C40F"),        # Green-yellow
    "finance": ("#1B2A4A", "#E67E22"),       # Navy-orange
    "healthcare": ("#1ABC9C", "#ECF0F1"),    # Teal-white
    "hospitality": ("#722F37", "#C9A227"),   # Burgundy-gold
    "manufacturing": ("#C0392B", "#1B2A4A"), # Red-navy
    "marketing": ("#C9A227", "#1A1A1A"),     # Gold-black
    "nonprofit": ("#2980B9", "#27AE60"),     # Blue-green
    "technology": ("#F1C40F", "#8E44AD"),    # Yellow-purple
}

# Generic person initials for team/trustee placeholders
PERSON_INITIALS = ["AB", "CD", "EF", "GH", "IJ", "KL", "MN", "OP", "QR", "ST"]


def create_svg_logo(width=200, height=60, text="Your Logo", color="#4A6FA5"):
    """Create an SVG logo placeholder."""
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <rect width="{width}" height="{height}" rx="8" fill="{color}" opacity="0.1"/>
  <rect x="2" y="2" width="{width-4}" height="{height-4}" rx="6" fill="none" stroke="{color}" stroke-width="2" stroke-dasharray="6,3"/>
  <text x="{width//2}" y="{height//2 + 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="{color}">{text}</text>
</svg>'''
    return svg


def create_svg_partner_logo(width=150, height=60, text="Partner", color="#666666"):
    """Create an SVG partner logo placeholder."""
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <rect width="{width}" height="{height}" rx="6" fill="#f0f0f0"/>
  <rect x="1" y="1" width="{width-2}" height="{height-2}" rx="5" fill="none" stroke="{color}" stroke-width="1" stroke-dasharray="4,2"/>
  <text x="{width//2}" y="{height//2 + 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="{color}">{text}</text>
</svg>'''
    return svg


def create_svg_certification(width=100, height=100, text="Cert", color="#666666"):
    """Create an SVG certification badge placeholder."""
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <circle cx="{width//2}" cy="{height//2}" r="{min(width,height)//2 - 4}" fill="#f5f5f5" stroke="{color}" stroke-width="2"/>
  <text x="{width//2}" y="{height//2 + 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="{color}">{text}</text>
</svg>'''
    return svg


def save_svg_as_png(svg_content, filepath, width, height):
    """Save SVG content as a PNG file (since templates reference .png).
    We create a simple raster version using Pillow instead."""
    # Parse the SVG and create a simple raster equivalent
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw a placeholder box
    draw.rounded_rectangle([2, 2, width-2, height-2], radius=6,
                          outline=(100, 100, 100, 200), width=2)

    # Try to get a font
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
    except (OSError, IOError):
        font = ImageFont.load_default()

    # Draw centered text
    text = "Your Logo"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((width - tw) // 2, (height - th) // 2), text,
              fill=(100, 100, 100, 220), font=font)

    img.save(filepath, 'PNG')


def create_gradient_image(width, height, color1_hex, color2_hex, filepath):
    """Create a gradient background image."""
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)

    c1 = tuple(int(color1_hex.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
    c2 = tuple(int(color2_hex.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))

    for y in range(height):
        ratio = y / max(height - 1, 1)
        r = int(c1[0] + (c2[0] - c1[0]) * ratio)
        g = int(c1[1] + (c2[1] - c1[1]) * ratio)
        b = int(c1[2] + (c2[2] - c1[2]) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    img.save(filepath, quality=85)


def create_person_placeholder(width, height, initials, color_hex, filepath):
    """Create a person photo placeholder with initials on colored circle."""
    img = Image.new('RGB', (width, height), (240, 240, 240))
    draw = ImageDraw.Draw(img)

    c = tuple(int(color_hex.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))

    # Draw circle
    cx, cy = width // 2, height // 2
    radius = min(width, height) // 2 - 10
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=c)

    # Draw initials
    font_size = max(radius // 2, 16)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except (OSError, IOError):
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), initials, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text((cx - tw // 2, cy - th // 2), initials, fill=(255, 255, 255), font=font)

    img.save(filepath, quality=85)


def create_logo_placeholder(width, height, text, color_hex, filepath):
    """Create a simple logo placeholder PNG."""
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    c = tuple(int(color_hex.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))

    # Draw rounded rectangle border
    draw.rounded_rectangle([2, 2, width - 2, height - 2], radius=8,
                          outline=c + (200,), width=2)

    # Draw dashed inner hint
    for x in range(10, width - 10, 12):
        draw.line([(x, height // 2 - 1), (x + 6, height // 2 - 1)],
                  fill=c + (80,), width=1)

    font_size = min(height // 3, 18)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except (OSError, IOError):
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((width - tw) // 2, (height - th) // 2), text,
              fill=c + (220,), font=font)

    img.save(filepath, 'PNG')


def create_solid_color_image(width, height, color_hex, filepath, text=None):
    """Create a solid color image with optional text overlay."""
    c = tuple(int(color_hex.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
    img = Image.new('RGB', (width, height), c)

    if text:
        draw = ImageDraw.Draw(img)
        # Light overlay text
        font_size = min(width, height) // 8
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", max(font_size, 14))
        except (OSError, IOError):
            font = ImageFont.load_default()

        bbox = draw.textbbox((0, 0), text, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        # Semi-transparent white text
        draw.text(((width - tw) // 2, (height - th) // 2), text,
                  fill=(255, 255, 255), font=font)

    if filepath.endswith('.jpg') or filepath.endswith('.jpeg'):
        img.save(filepath, 'JPEG', quality=85)
    else:
        img.save(filepath, 'PNG')


def create_partner_placeholder(width, height, text, filepath):
    """Create a partner logo placeholder."""
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    draw.rounded_rectangle([1, 1, width - 1, height - 1], radius=4,
                          fill=(240, 240, 240, 255),
                          outline=(180, 180, 180, 200), width=1)

    font_size = min(height // 3, 13)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except (OSError, IOError):
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((width - tw) // 2, (height - th) // 2), text,
              fill=(120, 120, 120, 220), font=font)

    img.save(filepath, 'PNG')


def create_article_placeholder(width, height, color1_hex, color2_hex, filepath):
    """Create an article/feature image placeholder with subtle gradient."""
    create_gradient_image(width, height, color1_hex, color2_hex, filepath)


def get_image_extension(filepath):
    """Get the file extension."""
    return os.path.splitext(filepath)[1].lower()


# ---- Template-specific image replacement maps ----

def process_template(category, template_name):
    """Process a single template, replacing all proprietary images."""
    template_dir = os.path.join(REPO_ROOT, category, template_name)
    images_dir = os.path.join(template_dir, "images")

    if not os.path.isdir(images_dir):
        print(f"  No images directory for {category}/{template_name}, skipping image generation")
        return

    c1, c2 = CATEGORY_COLORS.get(category, ("#666666", "#999999"))

    # Get list of existing image files
    existing_images = set(os.listdir(images_dir))

    # Skip list - generic icons that are NOT proprietary
    skip_patterns = [
        'icon-facebook', 'icon-instagram', 'icon-linkedin', 'icon-youtube',
        'icon-twitter', 'social-facebook', 'social-twitter', 'social-icons',
        'icon-arrow', 'icon-search', 'icon-location', 'icon-mail', 'icon-phone',
        'icon-person', 'icon-members', 'icon-clock', 'icon-arrow-right',
        'icon-email', 'icon-dropdown', 'arrow-icon', 'arrow-down',
        'icon-bed', 'icon-bird', 'icon-car', 'icon-landscape', 'icon-safari',
        'dots-pattern', 'stat-circle', 'leaf-blob', 'tree-blob', 'stars',
        'hero-overlay', 'service-icon-', 'focus-icon-', 'focus-circle',
        'gold-triangles', 'icon-east', 'icon-social-media', 'video-play-btn',
        'icon-arrow-back', 'icon-arrow-forward', 'play-button', 'chat-icon',
        'nav-line', 'accent-line', 'removal-bg', 'service-card-bg',
        'icon-pillar-', 'icon-skills-', 'icon-entrepreneurship',
        'README', 'step-', 'piggy-bank', 'electricity-costs', 'who-can-save',
        'email-icon', 'phone-icon', 'linkedin-icon',
        'icon-education', 'icon-enterprise', 'icon-food',
        'icon-email-dark', 'icon-linkedin-dark', 'icon-linkedin-white',
        'icon-phone-dark', 'section-bg',
    ]

    for img_file in sorted(existing_images):
        img_path = os.path.join(images_dir, img_file)
        if not os.path.isfile(img_path):
            continue

        # Skip non-image files
        ext = get_image_extension(img_file)
        if ext not in ('.png', '.jpg', '.jpeg', '.svg'):
            continue

        # Check if this should be skipped
        basename = os.path.splitext(img_file)[0]
        should_skip = False
        for pattern in skip_patterns:
            if pattern in basename:
                should_skip = True
                break
        if should_skip:
            print(f"    SKIP (generic): {img_file}")
            continue

        # Determine replacement type based on filename
        if 'logo' in basename.lower():
            if 'footer' in basename.lower():
                create_logo_placeholder(200, 60, "Your Logo", c1, img_path)
            elif 'gold' in basename.lower():
                create_logo_placeholder(200, 60, "Your Logo", "#C9A227", img_path)
            elif 'conference' in basename.lower():
                create_logo_placeholder(160, 160, "Event Logo", c1, img_path)
            elif 'capaciti' in basename.lower():
                create_logo_placeholder(200, 60, "Your Logo", c1, img_path)
            else:
                create_logo_placeholder(200, 60, "Your Logo", c1, img_path)
            print(f"    REPLACED logo: {img_file}")

        elif 'hero-bg' in basename or 'hero-banner' in basename:
            w, h = (1920, 800)
            if ext == '.jpg' or ext == '.jpeg':
                create_gradient_image(w, h, c1, c2, img_path)
            else:
                create_gradient_image(w, h, c1, c2, img_path)
            print(f"    REPLACED hero-bg: {img_file}")

        elif 'hero-slide' in basename:
            create_gradient_image(1920, 800, c1, c2, img_path)
            print(f"    REPLACED hero-slide: {img_file}")

        elif any(p in basename for p in ['team-member', 'member-', 'trustee-',
                                          'testimonial-image', 'delegate-photo',
                                          'impact-person', 'hero-person',
                                          'calculator-person']):
            idx = 0
            for ch in basename:
                if ch.isdigit():
                    idx = int(ch) - 1
                    break
            initials = PERSON_INITIALS[idx % len(PERSON_INITIALS)]
            create_person_placeholder(400, 400, initials, c1, img_path)
            print(f"    REPLACED person: {img_file}")

        elif 'testimonial-' in basename and basename != 'testimonial-image':
            idx = 0
            for ch in basename:
                if ch.isdigit():
                    idx = int(ch) - 1
                    break
            initials = PERSON_INITIALS[idx % len(PERSON_INITIALS)]
            create_person_placeholder(150, 150, initials, c1, img_path)
            print(f"    REPLACED testimonial: {img_file}")

        elif any(p in basename for p in ['partner-', 'aws-logo', 'microsoft-logo',
                                          'coursera-logo', 'comptia-logo', 'qcto-logo',
                                          'propella-logo', 'icdl-logo', 'ceta-logo',
                                          'seta-logo', 'partner-google', 'partner-meta',
                                          'partner-klaviyo', 'partner-youtube',
                                          'partner-whatagraph', 'partner-shopcreative',
                                          'client-']):
            num = ""
            for ch in basename:
                if ch.isdigit():
                    num += ch
            label = f"Partner {num}" if num else "Partner"
            # Check for client- prefix
            if 'client-' in basename:
                label = f"Client {num}" if num else "Client"
            create_partner_placeholder(150, 60, label, img_path)
            print(f"    REPLACED partner/client: {img_file}")

        elif 'cert-logo' in basename:
            num = ""
            for ch in basename:
                if ch.isdigit():
                    num += ch
            label = f"Cert {num}" if num else "Certification"
            create_partner_placeholder(100, 100, label, img_path)
            print(f"    REPLACED certification: {img_file}")

        elif any(p in basename for p in ['article-', 'featured-story', 'news-',
                                          'case-study-', 'quicklink-']):
            w, h = (600, 400)
            create_article_placeholder(w, h, c1, c2, img_path)
            print(f"    REPLACED article/news: {img_file}")

        elif any(p in basename for p in ['about-', 'what-we-do-bg', 'community-bg',
                                          'apply-now-bg', 'apply-bg', 'speak-out-bg',
                                          'impact-bg', 'map-bg', 'services-bg',
                                          'subscribe-image', 'products-banner-bg',
                                          'where-making-diff-bg', 'speak-out-image',
                                          'qa-bg', 'exhibition', 'video-thumbnail',
                                          'chandelier', 'group-photo', 'teen-girl',
                                          'impact-visual', 'hero-wordmark']):
            w, h = (800, 500)
            create_gradient_image(w, h, c1, c2, img_path)
            print(f"    REPLACED background/feature: {img_file}")

        elif any(p in basename for p in ['product-', 'showcase-', 'lodge-']):
            w, h = (600, 400)
            create_article_placeholder(w, h, c1, c2, img_path)
            print(f"    REPLACED product/showcase: {img_file}")

        elif any(p in basename for p in ['solution-', 'card-', 'get-to-know-',
                                          'visionary-']):
            w, h = (400, 300)
            create_article_placeholder(w, h, c1, c2, img_path)
            print(f"    REPLACED card/solution: {img_file}")

        elif any(p in basename for p in ['badge-', 'listen-icon']):
            create_solid_color_image(100, 100, c1, img_path, "Badge")
            print(f"    REPLACED badge: {img_file}")

        elif basename == 'hero-image':
            create_gradient_image(1920, 800, c1, c2, img_path)
            print(f"    REPLACED hero-image: {img_file}")

        else:
            print(f"    UNMATCHED (keeping): {img_file}")


def process_all_templates():
    """Process all templates across all categories."""
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
            print(f"\n=== Processing {category}/{template} ===")
            process_template(category, template)


if __name__ == "__main__":
    process_all_templates()
    print("\n✓ All placeholder images generated.")
