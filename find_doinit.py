import re

with open('pragmatic_runner/public/gs2c/common/v3/games-html5/games/vs/vs20wraanu/desktop/build.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

idx = text.find('doInit')
while idx != -1:
    print("--- Context around doInit at", idx, "---")
    print(text[max(0, idx-200): min(len(text), idx+300)])
    idx = text.find('doInit', idx + 1)
    if idx > 2000000:
        break
