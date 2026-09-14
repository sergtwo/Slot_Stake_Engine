import json
import base64
import os
import re

HAR_PATH = r"D:\Slot Stake Engine\stake.bet.har"
OUT_DIR = r"D:\Slot Stake Engine\sandbox\public\assets\game_res"
os.makedirs(OUT_DIR, exist_ok=True)

with open(HAR_PATH, "r", encoding="utf-8", errors="ignore") as f:
    data = json.load(f)

pattern = re.compile(r'data:image/(png|jpeg);base64,([A-Za-z0-9+/=]+)')
count = 0

for e in data["log"]["entries"]:
    txt = e.get("response", {}).get("content", {}).get("text", "")
    if "base64" in txt:
        for m in pattern.finditer(txt):
            img_type, b64 = m.groups()
            # on ne prend que les images significatives (> 200 octets b64)
            if len(b64) > 300:
                ext = ".png" if img_type == "png" else ".jpg"
                fname = f"extracted_img_{count}{ext}"
                with open(os.path.join(OUT_DIR, fname), "wb") as f_out:
                    try:
                        f_out.write(base64.b64decode(b64))
                        count += 1
                    except Exception:
                        pass

print(f"Total images base64 extraites : {count}")
