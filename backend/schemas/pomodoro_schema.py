from pydantic import BaseModel
from typing import Literal

class PomodoroAction(BaseModel):
    action: Literal["START", "PAUSE", "RESET", "SET_MODE"]
    mode: Literal["WORK", "SHORT_BREAK", "LONG_BREAK"] = "WORK"
    duration_minutes: int = 25
