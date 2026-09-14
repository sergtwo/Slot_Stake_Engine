import json
import os
import base64
import urllib.parse

HAR_PATH = r"D:\Slot Stake Engine\stake.bet.har"
OUTPUT_DIR = r"D:\Slot Stake Engine\extracted_fury_of_anubis"

os.makedirs(os.path.join(OUTPUT_DIR, "images"), exist_ok=True)
os.makedirs(os.path.join(OUTPUT_DIR, "configs"), exist_ok=True)
os.makedirs(os.path.join(OUTPUT_DIR, "inline_textures"), exist_ok=True)

print("Chargement du fichier HAR...")
with open(HAR_PATH, "r", encoding="utf-8", errors="ignore") as f:
    data = json.load(f)

entries = data.get("log", {}).get("entries", [])
print(f"Nombre total d'entrees HAR : {len(entries)}")

img_count = 0
config_count = 0
inline_img_count = 0

for idx, entry in enumerate(entries):
    req_url = entry.get("request", {}).get("url", "")
    res = entry.get("response", {})
    content = res.get("content", {})
    mime = content.get("mimeType", "")
    text_data = content.get("text", "")
    encoding = content.get("encoding", "")

    parsed_path = urllib.parse.urlparse(req_url).path
    filename = os.path.basename(parsed_path)

    # 1. Images directes (PNG / JPG)
    if mime in ["image/png", "image/jpeg", "image/webp"] or any(filename.lower().endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp"]):
        if not filename:
            filename = f"image_{idx}.png"
        out_path = os.path.join(OUTPUT_DIR, "images", filename)
        
        try:
            if encoding == "base64" and text_data:
                with open(out_path, "wb") as img_file:
                    img_file.write(base64.b64decode(text_data))
                img_count += 1
            elif text_data:
                with open(out_path, "wb") as img_file:
                    img_file.write(text_data.encode("latin1", errors="ignore"))
                img_count += 1
        except Exception as e:
            print(f"Erreur extraction image {filename}: {e}")

    # 2. Configs & arbres de jeu (.json, .inf, .css)
    elif any(filename.lower().endswith(ext) for ext in [".json", ".inf", ".css", ".xml"]) and not filename.startswith("main_resources"):
        if text_data:
            out_path = os.path.join(OUTPUT_DIR, "configs", filename)
            try:
                with open(out_path, "w", encoding="utf-8", errors="ignore") as cfg_file:
                    cfg_file.write(text_data)
                config_count += 1
            except Exception as e:
                print(f"Erreur extraction config {filename}: {e}")

    # 3. Extraction des textures inlines depuis les fichiers main_resourcesXXX.json
    if "main_resources" in filename and text_data:
        try:
            res_json = json.loads(text_data)
            for item in res_json.get("resources", []):
                item_data = item.get("data", "")
                item_id = item.get("id", f"res_{inline_img_count}")
                if isinstance(item_data, str) and item_data.startswith("data:image/"):
                    header, b64 = item_data.split(",", 1)
                    ext = ".png" if "png" in header else ".jpg"
                    out_path = os.path.join(OUTPUT_DIR, "inline_textures", f"{item_id}{ext}")
                    with open(out_path, "wb") as f_out:
                        f_out.write(base64.b64decode(b64))
                    inline_img_count += 1
        except Exception:
            pass

print(f"\nExtraction terminee avec succes !")
print(f"- Images directes extraites : {img_count}")
print(f"- Textures inline extraites : {inline_img_count}")
print(f"- Fichiers de configuration extraits : {config_count}")
