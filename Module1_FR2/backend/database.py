# database.py = Supabase Client

import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client, Client


# =====================================================
# LOAD MODULE1 .ENV
# =====================================================

BASE_DIR = Path(__file__).resolve().parent

ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)


# =====================================================
# SUPABASE CONFIG
# =====================================================

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


if not SUPABASE_URL:
    raise RuntimeError(
        "SUPABASE_URL is not set in Module1_FR2/backend/.env"
    )


if not SUPABASE_KEY:
    raise RuntimeError(
        "SUPABASE_KEY is not set in Module1_FR2/backend/.env"
    )


# =====================================================
# SUPABASE CLIENT
# =====================================================

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)