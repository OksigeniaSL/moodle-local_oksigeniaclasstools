#!/bin/bash
# Builds an installable zip in dist/ (folder «oksigeniaclasstools», as Moodle expects for local plugins).
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
RELEASE=$(sed -n "s/^\$plugin->release *= *'\([^']*\)'.*/\1/p" "$HERE/version.php")
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
# The board's texts outside Moodle (English), always in step with the language pack.
python3 "$HERE/tools/strings.py" en "$HERE/app/strings.js" >/dev/null
mkdir "$TMP/oksigeniaclasstools"
(cd "$HERE" && git ls-files --cached --others --exclude-standard 2>/dev/null || find . -type f -not -path './.git/*' -not -path './dist/*' | sed 's|^\./||') \
    | grep -v -E '^(build\.sh|\.gitignore|\.github/|dist/|tools/)' | while read -r f; do
        mkdir -p "$TMP/oksigeniaclasstools/$(dirname "$f")"; cp "$HERE/$f" "$TMP/oksigeniaclasstools/$f"; done
mkdir -p "$HERE/dist"
ZIP="$HERE/dist/local_oksigeniaclasstools-$RELEASE.zip"
rm -f "$ZIP"; (cd "$TMP" && zip -qr "$ZIP" oksigeniaclasstools)
echo "$ZIP ($(du -h "$ZIP" | cut -f1))"
