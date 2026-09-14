with open('pragmatic_runner/public/gs2c/common/v3/games-html5/games/vs/vs20wraanu/desktop/build.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

target = "RequestManager.AddRequest"
idx = text.find(target)
while idx != -1:
    print(f"Match at {idx}:")
    print(text[max(0, idx-100): min(len(text), idx+300)])
    idx = text.find(target, idx+1)
    if idx > 1500000:
        break
