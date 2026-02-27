#!/bin/bash
# Upload template gallery (HTML + preview images) to assets S3 bucket
# Usage: ./upload_gallery.sh [aws-profile]
#
# This syncs _preview_index.html and all preview.png files to the assets bucket
# under the templates/gallery/ prefix, so the iframe can load them via CloudFront.

set -euo pipefail

PROFILE="${1:-Tebogo-dev}"
BUCKET="site-builder-dev-assets-536580886816"
PREFIX="templates/gallery"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Uploading Template Gallery to S3 ==="
echo "Profile: $PROFILE"
echo "Bucket:  s3://$BUCKET/$PREFIX/"
echo ""

# Upload the HTML file
echo "Uploading _preview_index.html..."
aws s3 cp "$SCRIPT_DIR/_preview_index.html" \
    "s3://$BUCKET/$PREFIX/_preview_index.html" \
    --content-type "text/html" \
    --profile "$PROFILE"

# Upload all preview images (preserving directory structure)
echo ""
echo "Uploading preview images..."
for img in $(find "$SCRIPT_DIR" -name "preview.png" -not -path "*/.git/*"); do
    # Get relative path from script dir
    rel_path="${img#$SCRIPT_DIR/}"
    echo "  $rel_path"
    aws s3 cp "$img" \
        "s3://$BUCKET/$PREFIX/$rel_path" \
        --content-type "image/png" \
        --profile "$PROFILE"
done

echo ""
echo "=== Upload Complete ==="
echo "Gallery URL: https://dgid362eqj1yw.cloudfront.net/$PREFIX/_preview_index.html"
echo ""
echo "NOTE: You may need to invalidate CloudFront cache:"
echo "  aws cloudfront create-invalidation --distribution-id <DIST_ID> --paths '/$PREFIX/*' --profile $PROFILE"
