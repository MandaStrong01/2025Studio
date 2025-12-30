# 1. Stop on first error
set -e

echo "=== BOLT EMERGENCY DEPLOY FIX ==="

# 2. Clean broken build artifacts (MOST COMMON CAUSE)
rm -rf node_modules dist .vite

# 3. Reinstall dependencies cleanly
npm install

# 4. Force a fresh production build
npm run build

echo "=== BUILD FINISHED — NOW RETRY DEPLOY ==="
