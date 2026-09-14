import json, sys

print("Scanning HAR...")
hits = []
with open('stake.bet.har', 'r', encoding='utf-8', errors='ignore') as f:
    for line in f:
        if '"url":' in line and any(k in line for k in ['gameService', 'doInit', 'doSpin', 'ge/v5', 'ge/']):
            hits.append(line.strip())
        elif '"url":' in line and any(k in line for k in ['vs20wraanu', 'html5', 'gs2c']):
            hits.append(line.strip())

print(f"Total hits: {len(hits)}")
for h in hits[:25]:
    print(h)
