import json
import os
import base64
import urllib.parse

HAR_PATH = r"D:\Slot Stake Engine\stake.bet.har"
BASE_OUT = r"D:\Slot Stake Engine\pragmatic_runner"
ASSETS_OUT = os.path.join(BASE_OUT, "public")
os.makedirs(ASSETS_OUT, exist_ok=True)

with open(HAR_PATH, "r", encoding="utf-8", errors="ignore") as f:
    data = json.load(f)

entries = data["log"]["entries"]
print(f"Total entries HAR : {len(entries)}")

saved = 0
for e in entries:
    url = e["request"]["url"]
    parsed = urllib.parse.urlparse(url)
    rel_path = parsed.path.lstrip("/")
    
    # On isole le chemin sous le dossier du jeu
    # ex: gs2c/common/v3/games-html5/games/vs/vs20wraanu/...
    out_file = os.path.join(ASSETS_OUT, rel_path)
    os.makedirs(os.path.dirname(out_file), exist_ok=True)
    
    res = e["response"]
    content = res.get("content", {})
    text = content.get("text", "")
    encoding = content.get("encoding", "")
    mime = content.get("mimeType", "")
    
    if not text:
        continue
        
    try:
        if encoding == "base64":
            with open(out_file, "wb") as f_out:
                f_out.write(base64.b64decode(text))
        else:
            with open(out_file, "w", encoding="utf-8", errors="ignore") as f_out:
                f_out.write(text)
        saved += 1
    except Exception as ex:
        pass

print(f"Extraction exacte de l arborescence web terminee : {saved} fichiers sauvegardes.")
