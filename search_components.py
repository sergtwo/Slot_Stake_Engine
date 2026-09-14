import json
import re

with open(r"D:\Slot Stake Engine\stake.bet.har", "r", encoding="utf-8", errors="ignore") as f:
    data = json.load(f)

pattern = re.compile(r'"name"\s*:\s*"([^"]*(?:sym|anubis|scatter|wild|gem|frame|reel|grid|hud|btn)[^"]*)"', re.IGNORECASE)

for e in data["log"]["entries"]:
    txt = e.get("response", {}).get("content", {}).get("text", "")
    matches = pattern.findall(txt)
    if matches:
        url = e["request"]["url"]
        print(f"URL: {url[:70]} | Matches: {set(matches[:10])}")
