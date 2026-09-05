import os
from pathlib import Path

from supabase import create_client, Client
from dotenv import load_dotenv

#------LOAD .ENV-----

BASE_DIR = Path(__file__).resolve().parent.parent 

ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None
