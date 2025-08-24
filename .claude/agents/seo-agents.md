#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running SEO validation hooks..."

# 1. Meta tag validation
echo "📋 Validating meta tags for all regions..."
node scripts/validate-seo-meta.js

# 2. Content SEO analysis
echo "📝 Analyzing content SEO scores..."
node scripts/analyze-seo-content.js

# 3. Page speed validation
echo "⚡ Checking page speed requirements..."
node scripts/validate-page-speed.js

# 4. Schema markup validation
echo "🏷️  Validating structured data..."
node scripts/validate-schema-markup.js

# 5. International SEO validation
echo "🌍 Checking hreflang and international SEO..."
node scripts/validate-international-seo.js

# 6. Mobile-first indexing validation
echo "📱 Validating mobile-first compliance..."
node scripts/validate-mobile-seo.js

echo "✅ SEO validation complete!"