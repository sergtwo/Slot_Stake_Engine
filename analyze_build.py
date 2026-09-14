import re

with open('pragmatic_runner/public/gs2c/common/v3/games-html5/games/vs/vs20wraanu/desktop/build.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

print("build.js total characters:", len(text))
for m in set(re.findall(r'action=[a-zA-Z0-9_]+', text)):
    print("Found action:", m)

for m in set(re.findall(r'do[A-Z][a-zA-Z0-9]+', text)):
    if any(k in m for k in ['Spin', 'Init', 'Collect', 'Bonus', 'Feature']):
        print("Found doMethod:", m)

for m in set(re.findall(r'https?://[^\s\'"]+', text[:500000])):
    if 'game' in m or 'gs2c' in m:
        print("Found URL:", m)
