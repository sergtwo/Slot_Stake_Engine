import asyncio
import json
import websockets
import base64

async def dump():
    uri = 'ws://localhost:9222/devtools/page/3BA56F557DD3DBB45C6D5B6A639380AA'
    # allow large frames (10 MB)
    async with websockets.connect(uri, max_size=15 * 1024 * 1024) as ws:
        for idx in range(3):
            req = {
                'id': idx + 1,
                'method': 'Runtime.evaluate',
                'params': {
                    'expression': f'document.querySelectorAll("canvas")[{idx}].toDataURL("image/png")',
                    'returnByValue': True
                }
            }
            await ws.send(json.dumps(req))
            res = json.loads(await ws.recv())
            data_url = res['result']['result']['value']
            header, encoded = data_url.split(',', 1)
            raw = base64.b64decode(encoded)
            filename = f'canvas_dump_{idx}.png'
            with open(filename, 'wb') as f:
                f.write(raw)
            print(f'Wrote {filename}, size: {len(raw)} bytes')

        # Full page screenshot via CDP
        await ws.send(json.dumps({'id': 100, 'method': 'Page.captureScreenshot'}))
        res_screen = json.loads(await ws.recv())
        screen_bytes = base64.b64decode(res_screen['result']['data'])
        with open('page_screenshot.png', 'wb') as f:
            f.write(screen_bytes)
        print(f'Wrote page_screenshot.png, size: {len(screen_bytes)} bytes')

asyncio.run(dump())
