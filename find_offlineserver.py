with open('pragmatic_runner/public/gs2c/common/v3/games-html5/games/vs/vs20wraanu/desktop/build.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

target = "OfflineServer.prototype.SendResponse"
idx = text.find(target)
if idx != -1:
    print(f"Found {target} at char {idx} (approx line {text[:idx].count(chr(10))+1})")
    print(text[idx-100:idx+800])
else:
    print("Not found")
