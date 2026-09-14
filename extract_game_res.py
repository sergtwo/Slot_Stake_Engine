import json
import base64
import os

HAR_PATH = r"D:\Slot Stake Engine\stake.bet.har"
OUT_DIR = r"D:\Slot Stake Engine\sandbox\public\assets\game_res"
os.makedirs(OUT_DIR, exist_ok=True)

with open(HAR_PATH, "r", encoding="utf-8", errors="ignore") as f:
    data = json.load(f)

extracted = 0
for e in data["log"]["entries"]:
    txt = e.get("response", {}).get("content", {}).get("text", "")
    if "resources" in txt:
        # Cherchons les fragments json
        try:
            # Traiter les fragments ou objets
            clean_txt = txt.strip()
            if clean_txt.startswith("{") and clean_txt.endswith("}"):
                j = json.loads(clean_txt)
                for r in j.get("resources", []):
                    r_id = r.get("id", "")
                    r_data = r.get("data", "")
                    if isinstance(r_data, str) and r_data.startswith("data:image/"):
                        header, b64 = r_data.split(",", 1)
                        ext = ".png" if "png" in header else ".jpg"
                        with open(os.path.join(OUT_DIR, f"{r_id}{ext}"), "wb") as out_f:
                            out_f.write(base64.b64decode(b64))
                        extracted += 1
        except Exception:
            pass

print(f"Total ressources extraites dans game_res : {extracted}")
