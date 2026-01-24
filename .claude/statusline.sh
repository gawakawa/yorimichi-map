#!/usr/bin/env bash
input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')
CWD=$(echo "$input" | jq -r '.workspace.current_dir')
CONTEXT_SIZE=$(echo "$input" | jq -r '.context_window.context_window_size')
CACHE_CREATE=$(echo "$input" | jq -r '.context_window.current_usage.cache_creation_input_tokens // 0')
CACHE_READ=$(echo "$input" | jq -r '.context_window.current_usage.cache_read_input_tokens // 0')

TOTAL_TOKENS=$((INPUT_TOKENS + CACHE_CREATE + CACHE_READ))
if [ "$CONTEXT_SIZE" -gt 0 ] 2>/dev/null; then
  CONTEXT_PERCENT=$((TOTAL_TOKENS * 100 / CONTEXT_SIZE))
else
  CONTEXT_PERCENT=0
fi

BAR_WIDTH=20
FILLED=$((CONTEXT_PERCENT * BAR_WIDTH / 100))
EMPTY=$((BAR_WIDTH - FILLED))
BAR=""
[ "$FILLED" -gt 0 ] && BAR=$(printf '█%.0s' $(seq 1 $FILLED))
[ "$EMPTY" -gt 0 ] && BAR="${BAR}$(printf '░%.0s' $(seq 1 $EMPTY))"

cd "$CWD" 2>/dev/null || true
GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")

echo "📁 ${CWD##*/} ${GIT_BRANCH:+🌿 $GIT_BRANCH }🤖 ${MODEL} [${BAR}] ${CONTEXT_PERCENT}%"
