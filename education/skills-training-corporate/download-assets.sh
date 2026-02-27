#!/bin/bash
# Download all Figma assets for CAPACITI Phase 1 template
# Usage: cd education/capaciti-phase1 && bash download-assets.sh

set -e

UA="User-Agent: Mozilla/5.0"
DIR="images"

echo "Downloading CAPACITI Phase 1 assets..."

# Logo
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/c5a625e0-3d9e-46e0-9c47-9e04fb1256ee" -o "$DIR/logo.png"
echo "  [OK] logo.png"

# Hero background
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/a8703f1c-b258-436c-ba6f-a48cb8f11137" -o "$DIR/hero-bg.png"
echo "  [OK] hero-bg.png"

# Solution cards (1-4)
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/3343b535-1faf-428a-a086-e5a9fd77c87b" -o "$DIR/solution-1.png"
echo "  [OK] solution-1.png"
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/2383a4a1-7b6b-43c5-a263-14b29dd27bcf" -o "$DIR/solution-2.png"
echo "  [OK] solution-2.png"
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/6d122b7b-b037-4b12-9210-faea7dd817f2" -o "$DIR/solution-3.png"
echo "  [OK] solution-3.png"
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/d7786ae2-deeb-47fd-b120-0cfd7858e003" -o "$DIR/solution-4.png"
echo "  [OK] solution-4.png"

# Impact person
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/1e593bef-05c3-4658-865e-fabf65e14b7d" -o "$DIR/impact-person.png"
echo "  [OK] impact-person.png"

# About section images (1-4)
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/22b16cc2-c7bd-42be-95d1-e47c266b9b45" -o "$DIR/about-1.png"
echo "  [OK] about-1.png"
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/723ff8cc-e9c7-48a7-a8a9-2cf80c120a35" -o "$DIR/about-2.png"
echo "  [OK] about-2.png"
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/22cd1cdf-0455-4a82-bb15-ada171fa589d" -o "$DIR/about-3.png"
echo "  [OK] about-3.png"
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/d353ac4b-9153-4bea-aefb-734cb5a59af6" -o "$DIR/about-4.png"
echo "  [OK] about-4.png"

# Testimonial photos
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/7e6505df-be76-4d21-8a1b-6df91fa1104a" -o "$DIR/testimonial-1.png"
echo "  [OK] testimonial-1.png"
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/5ccc771f-2acd-4650-8cb3-b92e02e8fdcc" -o "$DIR/testimonial-2.png"
echo "  [OK] testimonial-2.png"

# Partner logos (1-8)
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/d0a7193f-1f2b-4d0f-856e-8e25ed38aebb" -o "$DIR/partner-1.png"
echo "  [OK] partner-1.png"
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/d2f98261-6b0a-4f9a-96a2-2aa15eb8c082" -o "$DIR/partner-2.png"
echo "  [OK] partner-2.png"
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/cc3eb21d-337d-4740-b065-117f666d609d" -o "$DIR/partner-3.png"
echo "  [OK] partner-3.png"
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/910da96e-8831-457b-b107-77c3f01c59de" -o "$DIR/partner-4.png"
echo "  [OK] partner-4.png"
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/012e102f-5b59-40e6-a56b-1cbd750cd33d" -o "$DIR/partner-5.png"
echo "  [OK] partner-5.png"
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/dfd011d5-b726-40a4-a82d-55768492e842" -o "$DIR/partner-6.png"
echo "  [OK] partner-6.png"
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/919b07e9-37c3-4dfb-9179-133335b82523" -o "$DIR/partner-7.png"
echo "  [OK] partner-7.png"
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/9a92848c-ca55-47df-bebd-694a25453e00" -o "$DIR/partner-8.png"
echo "  [OK] partner-8.png"

# Footer logo (copy of logo)
cp "$DIR/logo.png" "$DIR/footer-logo.png"
echo "  [OK] footer-logo.png (copied from logo.png)"

# Social icons
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/76e7b614-f333-4e06-98d2-cf801f028fca" -o "$DIR/icon-linkedin.png"
echo "  [OK] icon-linkedin.png"
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/bb918118-8175-4de5-908e-13123755a848" -o "$DIR/icon-instagram.png"
echo "  [OK] icon-instagram.png"
curl -sL -H "$UA" "https://www.figma.com/api/mcp/asset/9ef97b2e-066c-433f-95e6-4cf90cd6a192" -o "$DIR/icon-facebook.png"
echo "  [OK] icon-facebook.png"

echo ""
echo "All assets downloaded successfully!"
echo "Total images: $(ls -1 $DIR/*.png | wc -l)"
