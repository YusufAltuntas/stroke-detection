#!/bin/bash
# PostToolUse hook — her notebook yaziminda otomatik git commit
# Bu hook, Write veya Edit tool'u .ipynb dosyasina yazdiginda tetiklenir.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

# Sadece .ipynb dosyalarini izle
if [[ "$FILE_PATH" == *.ipynb ]]; then
    cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0
    git add "$FILE_PATH" 2>/dev/null
    git commit -m "auto: $(basename "$FILE_PATH") — $(date '+%Y-%m-%d %H:%M')" 2>/dev/null
fi

exit 0
