#!/usr/bin/env bash
# ── ATS Agent Quick Start ─────────────────────────────────────────────────
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo -e "${CYAN}"
echo "  ╔══════════════════════════════════════════╗"
echo "  ║    ATS Resume Optimization Agent         ║"
echo "  ║    Quick Start Script                    ║"
echo "  ╚══════════════════════════════════════════╝"
echo -e "${NC}"

# ── Check OpenAI key ──
if [ -z "$OPENAI_API_KEY" ]; then
  if [ -f backend/.env ]; then
    echo -e "${GREEN}✓ Found backend/.env${NC}"
    set -a; source backend/.env; set +a
  else
    echo -e "${YELLOW}⚠  OPENAI_API_KEY not set.${NC}"
    read -p "  Enter your OpenAI API key: " key
    echo "OPENAI_API_KEY=$key" > backend/.env
    export OPENAI_API_KEY="$key"
    echo -e "${GREEN}  Saved to backend/.env${NC}"
  fi
fi

# ── Backend ──
echo -e "\n${CYAN}▶ Setting up backend...${NC}"
cd backend

if [ ! -d "venv" ]; then
  echo "  Creating Python virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

echo "  Installing Python dependencies..."
pip install -q -r requirements.txt

echo -e "${GREEN}  Starting FastAPI backend on :8000${NC}"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# ── Frontend ──
echo -e "\n${CYAN}▶ Setting up frontend...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
  echo "  Installing npm packages (this may take a moment)..."
  npm install --silent
fi

echo -e "${GREEN}  Starting React frontend on :5173${NC}"
npm run dev &
FRONTEND_PID=$!
cd ..

# ── Done ──
echo -e "\n${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Both services running!${NC}"
echo -e ""
echo -e "  ${CYAN}Frontend:${NC}  http://localhost:5173"
echo -e "  ${CYAN}Backend:${NC}   http://localhost:8000"
echo -e "  ${CYAN}API Docs:${NC}  http://localhost:8000/docs"
echo -e ""
echo -e "  Press Ctrl+C to stop both services."
echo -e "${GREEN}════════════════════════════════════════${NC}\n"

# ── Wait & cleanup ──
trap "echo -e '\n${RED}Shutting down...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
