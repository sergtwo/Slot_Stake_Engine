import json

with open('stake.bet.har', 'r', encoding='utf-8', errors='ignore') as f:
    har = json.load(f)

entries = har.get('log', {}).get('entries', [])
print(f"Total entries in HAR: {len(entries)}")
matching = []
for i, e in enumerate(entries):
    u = e.get('request', {}).get('url', '')
    if any(k in u.lower() for k in ['gameservice', 'html5-script-external', 'service', 'spin', 'init', 'stats', 'open']):
        print(f"[{i}] {e.get('request',{}).get('method')} {u[:120]}")
