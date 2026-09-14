import json
import re
import base64
import os

HAR_PATH = r"D:\Slot Stake Engine\stake.bet.har"
OUT = r"D:\Slot Stake Engine\extracted_fury_of_anubis\inline_textures"
os.makedirs(OUT, exist_ok=True)

with open(HAR_PATH, "r", encoding="utf-8", errors="ignore") as f:
    data = json.load(f)

extracted = 0
pattern = re.compile(r'"id"\s*:\s*"([^"]+)"[^}]*?"data"\s*:\s*"data:image/(png|jpeg);base64,([^"]+)"')

for e in data["log"]["entries"]:
    url = e.get("request", {}).get("url", "")
    if "main_resources" in url:
        txt = e.get("response", {}).get("content", {}).get("text", "")
        for m in pattern.finditer(txt):
            res_id, img_type, b64_data = m.groups()
            ext = "png" if img_type == "png" else "jpg"
            fname = f"{res_id}.{ext}"
            try:
                with open(os.path.join(OUT, fname), "wb") as out_f:
                    out_f.write(base64.b64decode(b64_data))
                extracted += 1
            except Exception:
                pass

print(f"Total inline textures extraites avec succes : {extracted}")
