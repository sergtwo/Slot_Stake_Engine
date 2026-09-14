import json

print("Checking for html5-script-external in HAR...")
with open('stake.bet.har', 'r', encoding='utf-8', errors='ignore') as f:
    har = json.load(f)

entries = har.get('log', {}).get('entries', [])
for e in entries:
    req_url = e.get('request', {}).get('url', '')
    if 'html5-script-external' in req_url:
        resp = e.get('response', {})
        content = resp.get('content', {})
        text = content.get('text', '')
        print("FOUND html5-script-external! Length:", len(text))
        with open('pragmatic_runner/public/gs2c/common/js/html5-script-external.js', 'w', encoding='utf-8') as out:
            out.write(text)
        print("Saved to pragmatic_runner/public/gs2c/common/js/html5-script-external.js")

    if 'gameService' in req_url:
        print("FOUND gameService entry:", req_url, e.get('request', {}).get('method'))
        req_body = e.get('request', {}).get('postData', {}).get('text', '')
        resp_text = e.get('response', {}).get('content', {}).get('text', '')
        print("REQ:", req_body[:100])
        print("RESP:", resp_text[:150])
