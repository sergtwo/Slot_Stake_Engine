import json
import re

with open(r"D:\Slot Stake Engine\stake.bet.har", "r", encoding="utf-8", errors="ignore") as f:
    data = json.load(f)

pattern = re.compile(r'"name"\s*:\s*"(wran_[^"]+SkeletonData)"')
found = set()

for e in data["log"]["entries"]:
    txt = e.get("response", {}).get("content", {}).get("text", "")
    for m in pattern.findall(txt):
        found.add(m)

print("Spine Skeletons trouvés dans Fury of Anubis :")
for s in sorted(found):
    print(" -", s)
