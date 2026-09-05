import os

LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY", "dummy_livekit_key")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET", "dummy_livekit_secret_that_is_long_enough_for_hmac")
LIVEKIT_URL = os.getenv("LIVEKIT_URL", "https://dummy.livekit.cloud")