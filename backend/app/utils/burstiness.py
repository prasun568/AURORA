import re
import statistics
from typing import Any, Dict, List

BANNED_WORDS = [
    "delve", "tapestry", "landscape", "crucial", "pivotal",
    "intricate", "realm", "testament", "navigate", "underscore",
    "furthermore", "moreover", "multifaceted", "paradigm", "leverage",
    "seamless", "it is important to note", "in conclusion"
]


def check_burstiness(text: str) -> Dict[str, Any]:
    # Split text on sentence terminators [.!?]+
    raw_sentences = re.split(r'[.!?]+', text)
    lengths = [len(s.strip().split()) for s in raw_sentences if s.strip()]

    if len(lengths) < 5:
        return {"score": 0.0, "verdict": "too_short"}

    mean_length = statistics.mean(lengths)
    stdev = statistics.stdev(lengths)
    score = stdev / mean_length if mean_length > 0 else 0.0
    verdict = "natural" if score > 0.45 else "too_uniform"

    return {
        "mean_length": mean_length,
        "stdev": stdev,
        "score": score,
        "verdict": verdict
    }


def find_banned_words(text: str) -> List[str]:
    text_lower = text.lower()
    return [w for w in BANNED_WORDS if w in text_lower]
