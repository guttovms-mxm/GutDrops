#!/usr/bin/env bash
set -euo pipefail

BUCKET="theslimflix-lp"
DISTRIBUTION_ID="E17C6R6JMNWP4K"
REGION="us-east-1"

echo "==> Syncing to S3..."
aws s3 sync . s3://$BUCKET \
  --region $REGION \
  --exclude ".git/*" \
  --exclude "infra/*" \
  --exclude "tasks/*" \
  --exclude "CLAUDE.md" \
  --exclude ".DS_Store" \
  --delete

echo "==> Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

echo "==> Deploy complete."
