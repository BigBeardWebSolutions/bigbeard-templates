#!/usr/bin/env python3
"""
Embedding Generator for RAG Template Service

Per LLD 3.2.2: S3 Vectors + Lambda Caching architecture

Generates vector embeddings for all templates using Amazon Titan Embeddings v2.
Stores embeddings in S3 vectors bucket and metadata in DynamoDB.

Usage:
    python generate_embeddings.py
    python generate_embeddings.py --environment dev
    python generate_embeddings.py --template technology/bbws-ai-page-builder
"""
import os
import sys
import json
import argparse
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
from decimal import Decimal

import boto3
from botocore.config import Config

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration per LLD 3.2.2
EMBEDDING_MODEL_ID = "amazon.titan-embed-text-v2:0"
EMBEDDING_DIMENSION = 1024  # Titan v2 uses 1024 dimensions
MAX_INPUT_TOKENS = 8192

# Valid industries
VALID_INDUSTRIES = [
    "restaurant", "healthcare", "technology", "ecommerce", "real_estate",
    "professional_services", "creative_agency", "education", "nonprofit",
    "fitness", "hospitality", "finance", "retail", "automotive", "beauty_spa", "other"
]


class DecimalEncoder(json.JSONEncoder):
    """Handle Decimal types from DynamoDB."""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)


class EmbeddingGenerator:
    """
    Generates and stores embeddings for RAG template matching.

    Per LLD 3.2.2:
    - Embeddings stored in S3 vectors bucket
    - Metadata stored in DynamoDB templates table
    """

    def __init__(self, region_name: str = "eu-west-1", environment: str = "dev"):
        self.region_name = region_name
        self.environment = environment

        # S3 buckets
        self.templates_bucket = f"bbws-templates-{environment}"
        self.vectors_bucket = f"bbws-{environment}-vectors"

        # DynamoDB tables
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

        logger.info(f"EmbeddingGenerator initialized:")
        logger.info(f"  Region: {region_name}")
        logger.info(f"  Templates bucket: {self.templates_bucket}")
        logger.info(f"  Vectors bucket: {self.vectors_bucket}")
        logger.info(f"  DynamoDB table: {self.templates_table}")

    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding vector for text using Titan Embeddings v2."""
        try:
            # Truncate if too long
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
            embedding = response_body.get("embedding", [])

            if len(embedding) != EMBEDDING_DIMENSION:
                logger.warning(f"Unexpected embedding dimension: {len(embedding)}, expected {EMBEDDING_DIMENSION}")

            return embedding

        except Exception as e:
            logger.exception(f"Error generating embedding: {e}")
            raise

    def build_embedding_text(self, metadata: Dict[str, Any]) -> str:
        """
        Build rich semantic text for embedding from metadata.

        Per LLD 3.2.2 Section 6.5:
        Compose rich description to capture template characteristics.
        """
        parts = []

        # Core attributes
        parts.append(f"Industry: {metadata.get('industry', 'general')}")
        parts.append(f"CTA Intent: {metadata.get('cta_intent', 'contact')}")
        parts.append(f"Design Style: {metadata.get('design_style', 'modern')}")

        # Sections
        sections = metadata.get('sections', [])
        if sections:
            parts.append(f"Sections: {', '.join(sections)}")

        # Color palette
        color_palette = metadata.get('color_palette', {})
        if color_palette:
            primary = color_palette.get('primary', '')
            parts.append(f"Color Palette: {primary} primary")

        # Keywords/tags
        keywords = metadata.get('keywords', [])
        if keywords:
            parts.append(f"Tags: {', '.join(keywords)}")

        # Description
        description = metadata.get('description', '')
        if description:
            parts.append(description)

        # Build final text with semantic summary
        industry = metadata.get('industry', 'general')
        cta_intent = metadata.get('cta_intent', 'contact')
        design_style = metadata.get('design_style', 'modern')
        sections_preview = ', '.join(sections[:3]) if sections else 'standard'

        semantic_summary = f"""
        This is a {design_style} website template for the {industry} industry,
        optimized for {cta_intent} conversions with sections including {sections_preview}.
        """

        parts.append(semantic_summary)

        return " ".join(parts)

    def process_template(self, template_path: Path) -> Optional[Dict[str, Any]]:
        """Process a single template and generate embedding."""
        metadata_path = template_path / "metadata.json"

        if not metadata_path.exists():
            logger.warning(f"No metadata.json found in {template_path}")
            return None

        try:
            with open(metadata_path) as f:
                metadata = json.load(f)

            # Build embedding text
            embedding_text = self.build_embedding_text(metadata)

            # Generate embedding
            logger.info(f"Generating embedding for: {metadata.get('template_id', template_path.name)}")
            embedding = self.generate_embedding(embedding_text)

            # Build result with all metadata needed for RAG
            result = {
                "template_id": metadata.get("template_id", template_path.name),
                "name": metadata.get("name", ""),
                "industry": metadata.get("industry", "other"),
                "cta_intent": metadata.get("cta_intent", "contact"),
                "design_style": metadata.get("design_style", "modern"),
                "sections": metadata.get("sections", []),
                "keywords": metadata.get("keywords", []),
                "color_palette": metadata.get("color_palette", {}),
                "customizable_fields": metadata.get("customizable_fields", []),
                "css_variables": metadata.get("css_variables", []),
                "description": metadata.get("description", ""),
                "figma_source": metadata.get("figma_source", ""),
                "s3_path": f"website-templates/{template_path.parent.name}/{template_path.name}/",
                "preview_url": f"https://{self.templates_bucket}.s3.{self.region_name}.amazonaws.com/website-templates/{template_path.parent.name}/{template_path.name}/preview.png",
                "embedding_text": embedding_text[:500],
                "embedding": embedding,
                "embedding_model": EMBEDDING_MODEL_ID,
                "embedding_dimension": EMBEDDING_DIMENSION,
                "status": "PUBLISHED",
                "created_at": metadata.get("created_at", datetime.utcnow().isoformat() + "Z"),
                "updated_at": datetime.utcnow().isoformat() + "Z",
            }

            logger.info(f"Generated embedding for: {result['template_id']} ({len(embedding)} dimensions)")
            return result

        except Exception as e:
            logger.exception(f"Error processing template {template_path}: {e}")
            return None

    def process_all_templates(self, base_path: Path) -> List[Dict[str, Any]]:
        """Process all templates and generate embeddings."""
        embeddings = []

        for industry in VALID_INDUSTRIES:
            industry_path = base_path / industry
            if not industry_path.exists():
                continue

            for template_dir in industry_path.iterdir():
                if not template_dir.is_dir() or template_dir.name.startswith('.'):
                    continue

                result = self.process_template(template_dir)
                if result:
                    embeddings.append(result)

        logger.info(f"Generated {len(embeddings)} embeddings")
        return embeddings

    def save_to_s3_vectors(self, embeddings: List[Dict[str, Any]]) -> None:
        """
        Save embeddings to S3 vectors bucket.

        Structure: s3://bbws-dev-vectors/template-embeddings/{template_id}
        """
        for embedding_data in embeddings:
            template_id = embedding_data["template_id"]

            # Prepare vector document for S3 Vectors
            vector_doc = {
                "id": template_id,
                "vector": embedding_data["embedding"],
                "metadata": {
                    "template_id": template_id,
                    "name": embedding_data["name"],
                    "industry": embedding_data["industry"],
                    "cta_intent": embedding_data["cta_intent"],
                    "design_style": embedding_data["design_style"],
                    "sections": embedding_data["sections"],
                    "keywords": embedding_data["keywords"],
                    "status": embedding_data["status"],
                    "s3_path": embedding_data["s3_path"],
                    "preview_url": embedding_data["preview_url"],
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

        # Save index
        index = {
            "vectors_count": len(embeddings),
            "model": EMBEDDING_MODEL_ID,
            "dimension": EMBEDDING_DIMENSION,
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "templates": [
                {
                    "template_id": e["template_id"],
                    "name": e["name"],
                    "industry": e["industry"],
                }
                for e in embeddings
            ],
        }

        self._s3_client.put_object(
            Bucket=self.vectors_bucket,
            Key="template-embeddings/index.json",
            Body=json.dumps(index, indent=2).encode("utf-8"),
            ContentType="application/json",
            ServerSideEncryption="AES256",
        )

        logger.info(f"Saved vectors index with {len(embeddings)} templates")

    def save_to_dynamodb(self, embeddings: List[Dict[str, Any]]) -> None:
        """
        Save template metadata to DynamoDB.

        Table: rag-templates-{env}
        PK: TEMPLATE
        SK: TEMPLATE#{template_id}
        """
        for embedding_data in embeddings:
            template_id = embedding_data["template_id"]

            # DynamoDB item (without embedding vector - too large)
            item = {
                "PK": "TEMPLATE",
                "SK": f"TEMPLATE#{template_id}",
                "template_id": template_id,
                "name": embedding_data["name"],
                "industry": embedding_data["industry"],
                "cta_intent": embedding_data["cta_intent"],
                "design_style": embedding_data["design_style"],
                "sections": embedding_data["sections"],
                "keywords": embedding_data["keywords"],
                "color_palette": embedding_data["color_palette"],
                "customizable_fields": embedding_data["customizable_fields"],
                "css_variables": embedding_data["css_variables"],
                "description": embedding_data["description"],
                "figma_source": embedding_data["figma_source"],
                "s3_path": embedding_data["s3_path"],
                "preview_url": embedding_data["preview_url"],
                "vector_id": template_id,  # Reference to S3 vector
                "embedding_model": embedding_data["embedding_model"],
                "status": embedding_data["status"],
                "created_at": embedding_data["created_at"],
                "updated_at": embedding_data["updated_at"],
                # GSI keys
                "GSI1PK": f"INDUSTRY#{embedding_data['industry']}",
                "GSI1SK": f"STATUS#{embedding_data['status']}#{template_id}",
            }

            self._templates_table.put_item(Item=item)
            logger.info(f"Saved metadata to DynamoDB: {template_id}")

        logger.info(f"Saved {len(embeddings)} template metadata records to DynamoDB")

    def save_embeddings_local(self, embeddings: List[Dict[str, Any]], output_dir: Path) -> None:
        """Save embeddings locally for testing."""
        output_dir.mkdir(parents=True, exist_ok=True)

        for embedding_data in embeddings:
            template_id = embedding_data["template_id"]
            output_path = output_dir / f"{template_id}.json"

            with open(output_path, "w") as f:
                json.dump(embedding_data, f, indent=2, cls=DecimalEncoder)

            logger.info(f"Saved embedding to {output_path}")

        # Save index
        index_path = output_dir / "index.json"
        index = {
            "embeddings_count": len(embeddings),
            "model": EMBEDDING_MODEL_ID,
            "dimension": EMBEDDING_DIMENSION,
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "templates": [
                {
                    "template_id": e["template_id"],
                    "name": e["name"],
                    "industry": e["industry"],
                }
                for e in embeddings
            ],
        }

        with open(index_path, "w") as f:
            json.dump(index, f, indent=2)

        logger.info(f"Saved embedding index to {index_path}")


def main():
    parser = argparse.ArgumentParser(description="Generate embeddings for RAG templates")
    parser.add_argument("--environment", "-e", default="dev", choices=["dev", "sit", "prod"],
                        help="Target environment")
    parser.add_argument("--template", "-t", help="Process single template (e.g., technology/bbws-ai-page-builder)")
    parser.add_argument("--local", action="store_true", help="Save embeddings locally instead of AWS")
    parser.add_argument("--output-dir", "-o", default="./embeddings_output", help="Local output directory")
    parser.add_argument("--region", default="eu-west-1", help="AWS region")

    args = parser.parse_args()

    # Determine base path
    script_dir = Path(__file__).parent
    base_path = script_dir.parent

    # Initialize generator
    generator = EmbeddingGenerator(
        region_name=args.region,
        environment=args.environment,
    )

    # Process templates
    if args.template:
        template_path = base_path / args.template
        if not template_path.exists():
            logger.error(f"Template not found: {template_path}")
            sys.exit(1)

        result = generator.process_template(template_path)
        embeddings = [result] if result else []
    else:
        embeddings = generator.process_all_templates(base_path)

    if not embeddings:
        logger.warning("No embeddings generated")
        sys.exit(0)

    # Save embeddings
    if args.local:
        output_dir = Path(args.output_dir)
        generator.save_embeddings_local(embeddings, output_dir)
        print(f"\n✅ Saved {len(embeddings)} embeddings locally to {output_dir}")
    else:
        # Save to S3 vectors bucket
        generator.save_to_s3_vectors(embeddings)
        # Save metadata to DynamoDB
        generator.save_to_dynamodb(embeddings)
        print(f"\n✅ Generated and stored {len(embeddings)} embeddings:")
        print(f"   - S3 Vectors: s3://{generator.vectors_bucket}/template-embeddings/")
        print(f"   - DynamoDB: {generator.templates_table}")


if __name__ == "__main__":
    main()
