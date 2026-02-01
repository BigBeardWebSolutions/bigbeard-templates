#!/usr/bin/env python3
"""
Process Existing Templates from S3 for RAG Pipeline

Generates embeddings for templates in:
- site-builder-dev-design-assets-536580886816 (Figma templates)
- bigbeard-migrated-site-dev (Migrated WordPress sites)

Per LLD 3.2.2: S3 Vectors + Lambda Caching architecture
"""
import os
import json
import argparse
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

import boto3
from botocore.config import Config

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration per LLD 3.2.2
EMBEDDING_MODEL_ID = "amazon.titan-embed-text-v2:0"
EMBEDDING_DIMENSION = 1024
MAX_INPUT_TOKENS = 8192

# Source buckets
FIGMA_ASSETS_BUCKET = "site-builder-dev-design-assets-536580886816"
MIGRATED_SITES_BUCKET = "bigbeard-migrated-site-dev"


class ExistingTemplateProcessor:
    """Process templates from existing S3 buckets."""

    def __init__(self, region_name: str = "eu-west-1", environment: str = "dev"):
        self.region_name = region_name
        self.environment = environment

        # Target buckets/tables
        self.vectors_bucket = f"bbws-{environment}-vectors"
        self.templates_table = f"rag-templates-{environment}"

        # AWS clients
        self._bedrock_client = boto3.client(
            "bedrock-runtime",
            region_name=region_name,
            config=Config(retries={"max_attempts": 3, "mode": "adaptive"})
        )
        self._s3_client = boto3.client("s3", region_name=region_name)
        self._dynamodb = boto3.resource("dynamodb", region_name=region_name)
        self._templates_table = self._dynamodb.Table(self.templates_table)

        logger.info(f"ExistingTemplateProcessor initialized:")
        logger.info(f"  Region: {region_name}")
        logger.info(f"  Vectors bucket: {self.vectors_bucket}")
        logger.info(f"  DynamoDB table: {self.templates_table}")

    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding vector using Titan Embeddings v2."""
        if len(text) > MAX_INPUT_TOKENS * 4:
            text = text[:MAX_INPUT_TOKENS * 4]

        response = self._bedrock_client.invoke_model(
            modelId=EMBEDDING_MODEL_ID,
            body=json.dumps({
                "inputText": text,
                "dimensions": EMBEDDING_DIMENSION,
                "normalize": True
            }),
        )

        response_body = json.loads(response["body"].read())
        return response_body.get("embedding", [])

    def build_embedding_text(self, template: Dict[str, Any]) -> str:
        """Build rich semantic text for embedding."""
        parts = [
            f"Industry: {template.get('industry', 'general')}",
            f"CTA Intent: {template.get('cta_intent', 'contact')}",
            f"Design Style: {template.get('design_style', 'modern')}",
        ]

        if template.get('pages_count'):
            parts.append(f"Pages: {template['pages_count']} pages")

        if template.get('features'):
            parts.append(f"Features: {', '.join(template['features'])}")

        if template.get('name'):
            parts.append(f"Name: {template['name']}")

        # Semantic summary
        industry = template.get('industry', 'general')
        cta_intent = template.get('cta_intent', 'contact')
        design_style = template.get('design_style', 'modern')

        summary = f"""
        This is a {design_style} website template for the {industry} industry,
        optimized for {cta_intent} conversions.
        """
        parts.append(summary)

        return " ".join(parts)

    def fetch_registry(self) -> Dict[str, Any]:
        """Fetch template registry from S3."""
        response = self._s3_client.get_object(
            Bucket=FIGMA_ASSETS_BUCKET,
            Key="templates/template-registry.json"
        )
        return json.loads(response["Body"].read().decode("utf-8"))

    def process_recreated_templates(self, registry: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process recreated templates from Figma designs."""
        embeddings = []

        for template in registry.get("templates", []):
            template_id = template.get("template_id")
            logger.info(f"Processing recreated template: {template_id}")

            try:
                # Build embedding text
                embedding_text = self.build_embedding_text(template)

                # Generate embedding
                embedding = self.generate_embedding(embedding_text)

                result = {
                    "template_id": template_id,
                    "name": template.get("name", ""),
                    "source": "recreated",
                    "industry": template.get("industry", "general"),
                    "cta_intent": template.get("cta_intent", "contact"),
                    "design_style": template.get("design_style", "modern"),
                    "pages_count": template.get("pages_count", 0),
                    "primary_color": template.get("primary_color", ""),
                    "secondary_color": template.get("secondary_color", ""),
                    "s3_bucket": FIGMA_ASSETS_BUCKET,
                    "s3_path": template.get("s3_key", ""),
                    "preview_url": f"https://{FIGMA_ASSETS_BUCKET}.s3.{self.region_name}.amazonaws.com/{template.get('s3_key', '')}index.html",
                    "embedding": embedding,
                    "embedding_text": embedding_text[:500],
                    "status": "PUBLISHED",
                    "created_at": datetime.utcnow().isoformat() + "Z",
                }

                embeddings.append(result)
                logger.info(f"Generated embedding for: {template_id}")

            except Exception as e:
                logger.error(f"Error processing {template_id}: {e}")

        return embeddings

    def process_migrated_templates(self, registry: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process migrated WordPress site templates."""
        embeddings = []

        # Fetch the full migrated sites catalog
        try:
            catalog_response = self._s3_client.get_object(
                Bucket=FIGMA_ASSETS_BUCKET,
                Key="templates/migrated-sites-catalog.json"
            )
            catalog = json.loads(catalog_response["Body"].read().decode("utf-8"))
        except Exception as e:
            logger.warning(f"Could not fetch migrated sites catalog: {e}")
            catalog = {"sites": []}

        # Process from catalog or registry highlights
        sites = catalog.get("sites", registry.get("migrated_sites_highlights", []))

        for site in sites:  # Process all migrated sites
            site_slug = site.get("site_slug", site.get("slug", ""))
            if not site_slug:
                continue

            template_id = f"migrated-{site_slug}"
            logger.info(f"Processing migrated template: {template_id}")

            try:
                template_data = {
                    "industry": site.get("industry", "general"),
                    "cta_intent": "contact",
                    "design_style": "wordpress-migrated",
                    "pages_count": site.get("pages", 0),
                    "features": site.get("features", []),
                    "name": f"{site_slug.replace('-', ' ').title()} Migrated Site",
                }

                embedding_text = self.build_embedding_text(template_data)
                embedding = self.generate_embedding(embedding_text)

                result = {
                    "template_id": template_id,
                    "name": template_data["name"],
                    "source": "migrated",
                    "industry": template_data["industry"],
                    "cta_intent": template_data["cta_intent"],
                    "design_style": template_data["design_style"],
                    "pages_count": template_data["pages_count"],
                    "features": template_data["features"],
                    "s3_bucket": MIGRATED_SITES_BUCKET,
                    "s3_path": f"{site_slug}/",
                    "preview_url": f"https://{MIGRATED_SITES_BUCKET}.s3.{self.region_name}.amazonaws.com/{site_slug}/index.html",
                    "embedding": embedding,
                    "embedding_text": embedding_text[:500],
                    "status": "PUBLISHED",
                    "created_at": datetime.utcnow().isoformat() + "Z",
                }

                embeddings.append(result)
                logger.info(f"Generated embedding for: {template_id}")

            except Exception as e:
                logger.error(f"Error processing migrated {site_slug}: {e}")

        return embeddings

    def save_to_s3_vectors(self, embeddings: List[Dict[str, Any]]) -> None:
        """Save embeddings to S3 vectors bucket."""
        for embedding_data in embeddings:
            template_id = embedding_data["template_id"]

            vector_doc = {
                "id": template_id,
                "vector": embedding_data["embedding"],
                "metadata": {
                    "template_id": template_id,
                    "name": embedding_data["name"],
                    "source": embedding_data.get("source", "unknown"),
                    "industry": embedding_data["industry"],
                    "cta_intent": embedding_data["cta_intent"],
                    "design_style": embedding_data["design_style"],
                    "pages_count": embedding_data.get("pages_count", 0),
                    "s3_bucket": embedding_data.get("s3_bucket", ""),
                    "s3_path": embedding_data.get("s3_path", ""),
                    "preview_url": embedding_data.get("preview_url", ""),
                    "status": embedding_data["status"],
                }
            }

            s3_key = f"template-embeddings/{template_id}.json"

            self._s3_client.put_object(
                Bucket=self.vectors_bucket,
                Key=s3_key,
                Body=json.dumps(vector_doc, indent=2).encode("utf-8"),
                ContentType="application/json",
                ServerSideEncryption="AES256",
            )

            logger.info(f"Saved vector to s3://{self.vectors_bucket}/{s3_key}")

        # Update index
        self._update_vectors_index(embeddings)

    def _update_vectors_index(self, new_embeddings: List[Dict[str, Any]]) -> None:
        """Update the vectors index with new embeddings."""
        index_key = "template-embeddings/index.json"

        # Fetch existing index
        try:
            response = self._s3_client.get_object(
                Bucket=self.vectors_bucket,
                Key=index_key
            )
            existing_index = json.loads(response["Body"].read().decode("utf-8"))
        except Exception:
            existing_index = {"templates": []}

        # Merge templates
        existing_ids = {t["template_id"] for t in existing_index.get("templates", [])}
        for emb in new_embeddings:
            if emb["template_id"] not in existing_ids:
                existing_index.setdefault("templates", []).append({
                    "template_id": emb["template_id"],
                    "name": emb["name"],
                    "industry": emb["industry"],
                    "source": emb.get("source", "unknown"),
                })

        existing_index["vectors_count"] = len(existing_index.get("templates", []))
        existing_index["model"] = EMBEDDING_MODEL_ID
        existing_index["dimension"] = EMBEDDING_DIMENSION
        existing_index["updated_at"] = datetime.utcnow().isoformat() + "Z"

        self._s3_client.put_object(
            Bucket=self.vectors_bucket,
            Key=index_key,
            Body=json.dumps(existing_index, indent=2).encode("utf-8"),
            ContentType="application/json",
            ServerSideEncryption="AES256",
        )

        logger.info(f"Updated vectors index with {len(existing_index['templates'])} templates")

    def save_to_dynamodb(self, embeddings: List[Dict[str, Any]]) -> None:
        """Save template metadata to DynamoDB."""
        for embedding_data in embeddings:
            template_id = embedding_data["template_id"]

            item = {
                "PK": "TEMPLATE",
                "SK": f"TEMPLATE#{template_id}",
                "template_id": template_id,
                "name": embedding_data["name"],
                "source": embedding_data.get("source", "unknown"),
                "industry": embedding_data["industry"],
                "cta_intent": embedding_data["cta_intent"],
                "design_style": embedding_data["design_style"],
                "pages_count": embedding_data.get("pages_count", 0),
                "features": embedding_data.get("features", []),
                "primary_color": embedding_data.get("primary_color", ""),
                "secondary_color": embedding_data.get("secondary_color", ""),
                "s3_bucket": embedding_data.get("s3_bucket", ""),
                "s3_path": embedding_data.get("s3_path", ""),
                "preview_url": embedding_data.get("preview_url", ""),
                "vector_id": template_id,
                "embedding_model": EMBEDDING_MODEL_ID,
                "status": embedding_data["status"],
                "created_at": embedding_data["created_at"],
                "updated_at": datetime.utcnow().isoformat() + "Z",
                # GSI keys
                "GSI1PK": f"INDUSTRY#{embedding_data['industry']}",
                "GSI1SK": f"STATUS#{embedding_data['status']}#{template_id}",
            }

            self._templates_table.put_item(Item=item)
            logger.info(f"Saved metadata to DynamoDB: {template_id}")


def main():
    parser = argparse.ArgumentParser(description="Process existing S3 templates for RAG")
    parser.add_argument("--environment", "-e", default="dev", choices=["dev", "sit", "prod"])
    parser.add_argument("--region", default="eu-west-1")
    parser.add_argument("--recreated-only", action="store_true", help="Only process recreated templates")
    parser.add_argument("--migrated-only", action="store_true", help="Only process migrated templates")

    args = parser.parse_args()

    processor = ExistingTemplateProcessor(
        region_name=args.region,
        environment=args.environment,
    )

    # Fetch registry
    registry = processor.fetch_registry()
    logger.info(f"Loaded registry with {registry.get('total_templates', 0)} total templates")

    embeddings = []

    # Process templates
    if not args.migrated_only:
        recreated = processor.process_recreated_templates(registry)
        embeddings.extend(recreated)
        logger.info(f"Processed {len(recreated)} recreated templates")

    if not args.recreated_only:
        migrated = processor.process_migrated_templates(registry)
        embeddings.extend(migrated)
        logger.info(f"Processed {len(migrated)} migrated templates")

    if not embeddings:
        logger.warning("No embeddings generated")
        return

    # Save to S3 and DynamoDB
    processor.save_to_s3_vectors(embeddings)
    processor.save_to_dynamodb(embeddings)

    print(f"\n✅ Processed {len(embeddings)} templates:")
    print(f"   - S3 Vectors: s3://{processor.vectors_bucket}/template-embeddings/")
    print(f"   - DynamoDB: {processor.templates_table}")
    print(f"\nTemplates by source:")
    recreated_count = sum(1 for e in embeddings if e.get("source") == "recreated")
    migrated_count = sum(1 for e in embeddings if e.get("source") == "migrated")
    print(f"   - Recreated (Figma): {recreated_count}")
    print(f"   - Migrated (WordPress): {migrated_count}")


if __name__ == "__main__":
    main()
