#!/bin/bash
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
print_status(){ echo -e "${BLUE}[INFO]${NC} $1"; }
print_success(){ echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error(){ echo -e "${RED}[ERROR]${NC} $1"; }
print_warning(){ echo -e "${YELLOW}[WARNING]${NC} $1"; }

# Pick compose CLI
if command -v docker &>/dev/null && docker compose version &>/dev/null; then
  COMPOSE="docker compose"
elif command -v docker-compose &>/dev/null; then
  COMPOSE="docker-compose"
else
  print_error "Neither 'docker compose' nor 'docker-compose' found."
  exit 1
fi

ALLOW_TEST_FAILURES=false
if [[ ${RELAUNCH_ALLOW_TEST_FAILURES:-} =~ ^(1|true|yes)$ ]]; then ALLOW_TEST_FAILURES=true; fi

SKIP_PRUNE=true
if [[ ${RELAUNCH_SKIP_PRUNE:-} =~ ^(0|false|no)$ ]]; then SKIP_PRUNE=false; fi
if [[ ${RELAUNCH_FORCE_PRUNE:-} =~ ^(1|true|yes)$ ]]; then SKIP_PRUNE=false; fi

PERFORM_CLEAN_SHUTDOWN=true
if [[ ${RELAUNCH_SKIP_CLEAN_SHUTDOWN:-} =~ ^(1|true|yes)$ ]]; then PERFORM_CLEAN_SHUTDOWN=false; fi

COMPOSE_FILE=${COMPOSE_FILE:-docker-compose.yml}
APP_SERVICE=${APP_SERVICE:-web}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -b|--allow-test-failures) ALLOW_TEST_FAILURES=true;;
    -f|--force) PERFORM_CLEAN_SHUTDOWN=false;;
    -p|--prune) SKIP_PRUNE=false;;
    -h|--help)
      cat <<'USAGE'
Usage: ./relaunch.sh [-b|--allow-test-failures] [-f|--force] [-p|--prune]
Env:
  RELAUNCH_SKIP_CLEAN_SHUTDOWN=true  # skip clean shutdown request (same as -f)
  RELAUNCH_SKIP_PRUNE=false          # run docker prune without -p (default skips prune)
  RELAUNCH_FORCE_PRUNE=true          # force docker prune even if env says skip
  RELAUNCH_VERIFY_DELAY=3            # seconds to wait before ps check
  APP_SERVICE=web                    # docker compose service name
  COMPOSE_FILE=docker-compose.yml    # compose file to use
USAGE
      exit 0;;
    *) print_warning "Unknown argument: $1";;
  esac
  shift
done

# .env
if [[ -f .env ]]; then
  print_status "Loading environment from .env"
  set -a; source .env; set +a
else
  print_warning "No .env found; relying on current environment"
fi

echo "=========================================="
echo "  Music Theory Codex Relaunch Script"
echo "=========================================="
echo ""

# 1) Pull latest
print_status "Pulling latest from git…"
if git pull; then
  print_success "Git pull complete"
else
  print_error "Failed to pull changes from git repository"
  exit 1
fi

# 2) Ask application to close gracefully before shutdown (best-effort)
if [[ "${PERFORM_CLEAN_SHUTDOWN}" == "true" ]]; then
  print_status "Requesting graceful stop from ${APP_SERVICE}…"
  APP_CONTAINER_ID="$($COMPOSE -f "${COMPOSE_FILE}" ps -q "${APP_SERVICE}" || true)"
  if [[ -z "${APP_CONTAINER_ID}" ]]; then
    print_warning "Service ${APP_SERVICE} is not running; skipping graceful stop"
  elif $COMPOSE -f "${COMPOSE_FILE}" exec -T "${APP_SERVICE}" sh -c "if command -v nginx >/dev/null 2>&1; then nginx -s quit; fi"; then
    print_success "Application stop signal sent"
  else
    print_warning "Could not send graceful stop signal; continuing. Use -f to skip this step."
  fi
else
  print_warning "Skipping graceful stop due to --force flag or environment override"
fi

# 3) Stop existing stack
dedicated_args=("-f" "${COMPOSE_FILE}")
print_status "Stopping existing containers…"
$COMPOSE "${dedicated_args[@]}" down --volumes --remove-orphans \
  && print_success "Down complete"

# 4) (Optional) Prune BEFORE building so we don’t delete the fresh image
if [[ "${SKIP_PRUNE}" == "false" ]]; then
  print_status "Pruning unused Docker data (images/containers/networks)…"
  docker system prune -af \
    && print_success "Prune complete"
else
  print_warning "Skipping docker system prune (use -p to prune)"
fi

# 5) Build image(s) via compose
print_status "Building Docker image for ${APP_SERVICE}…"
if $COMPOSE -f "${COMPOSE_FILE}" build --pull "${APP_SERVICE}"; then
  print_success "Build complete"
else
  print_error "Docker build failed"; exit 1
fi

# 6) Test (local build validation)
print_status "Running frontend build for verification…"
if npm run build; then
  print_success "npm run build succeeded"
else
  if [[ "${ALLOW_TEST_FAILURES}" == "true" ]]; then
    print_warning "npm run build failed; continuing due to allow-test-failures"
  else
    print_error "npm run build failed; aborting"; exit 1
  fi
fi

# 7) Bring stack up
print_status "Starting new containers…"
if $COMPOSE -f "${COMPOSE_FILE}" up -d; then
  print_success "Stack is up"
else
  print_error "Compose up failed"; exit 1
fi

# 8) Verify
VERIFY_DELAY=${RELAUNCH_VERIFY_DELAY:-3}
sleep "${VERIFY_DELAY}"
if $COMPOSE -f "${COMPOSE_FILE}" ps | grep -q "Up"; then
  print_success "All containers are running"
else
  print_warning "Some containers may not be running:"
  $COMPOSE -f "${COMPOSE_FILE}" ps
fi

echo ""
echo "=========================================="
print_success "Music Theory Codex relaunched successfully!"
echo "=========================================="
echo ""
print_status "Follow logs:"
echo "  $COMPOSE -f ${COMPOSE_FILE} logs -f"
echo ""
print_status "Service logs:"
echo "  $COMPOSE -f ${COMPOSE_FILE} logs -f ${APP_SERVICE}"
echo ""
print_status "Status:"
echo "  $COMPOSE -f ${COMPOSE_FILE} ps"
