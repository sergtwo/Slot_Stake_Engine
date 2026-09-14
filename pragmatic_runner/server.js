const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Game State
let balance = 10000.00;
let balanceCash = 10000.00;
let index = 1;
let counter = 2;
let lastWin = 0.00;
let currentBet = 0.20;
let currentCoin = 0.01;
let currentLines = 20;

// Symbol pool for 6x5 grid (sw=6, sh=5 => 30 symbols)
// 1 = Scatter, 2 = Wild, 3 = Anubis, 4..7 = High, 8..12 = Low
const SYMBOLS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function getRandomGrid() {
  const grid = [];
  for (let i = 0; i < 30; i++) {
    const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    grid.push(sym);
  }
  return grid;
}

// MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.do': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=UTF-8',
  '.info': 'application/json; charset=UTF-8'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  console.log(`[${req.method}] ${pathname}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle customizations.info & versions.info
  if (pathname.endsWith('customizations.info') || pathname.endsWith('versions.info')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ customizations: [] }));
    return;
  }

  // Handle stats.do / clientLog.do
  if (pathname.includes('/stats.do') || pathname.includes('/clientLog.do')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  // Handle regulation/process.do
  if (pathname.includes('/regulation/process.do')) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('status=ok');
    return;
  }

  // Handle jackpot/reload.do
  if (pathname.includes('/jackpot/reload.do')) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('jackpot=0.00');
    return;
  }

  // Handle reloadBalance.do
  if (pathname.includes('/reloadBalance.do')) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`balance=${balance.toFixed(2)}&balance_cash=${balanceCash.toFixed(2)}&balance_bonus=0.00`);
    return;
  }

  // Handle closeGame.do / logout.do
  if (pathname.includes('/closeGame.do') || pathname.includes('/logout.do')) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('success=true');
    return;
  }

  // Handle saveSettings.do
  if (pathname.includes('/saveSettings.do')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const params = querystring.parse(body);
      const method = params.method || parsedUrl.query.method;
      const id = params.id || parsedUrl.query.id;
      console.log(`saveSettings: method=${method}, id=${id}`);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      if (id === 'vs20wraanu') {
        res.end('SoundState=true;');
      } else {
        res.end('{}');
      }
    });
    return;
  }

  // Handle /gs2c/gameService & /gs2c/ge/v5/gameService (and any nested path ending with /gameService)
  if (pathname.endsWith('/gameService')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const params = querystring.parse(body);
      const action = params.action;
      console.log(`gameService action: ${action}`, params);

      const stime = Date.now();

      if (action === 'doInit') {
        index++;
        counter++;

        // Base 6 reels strip definition
        const rStrip = "3,4,5,6,7,8,9,10,11,12,3,4,5,6,7,8,9,10,11,12,3,4,5,6,7,8,9,10,11,12";
        // 30 default initial screen symbols (6 cols x 5 rows)
        const defSymbols = "3,4,5,6,7,8,9,10,11,12,3,4,5,6,7,8,9,10,11,12,3,4,5,6,7,8,9,10,11,12";

        // Paytable for cluster / line evaluation: 13 symbols (0 to 12)
        const paytable = [
          "0,0,0,0,0", // 0
          "0,0,0,0,0", // 1 (Scatter)
          "0,0,0,0,0", // 2 (Wild)
          "50,25,10,2,0", // 3 (Anubis top)
          "25,15,5,1.5,0", // 4
          "15,10,4,1,0", // 5
          "12,8,3,0.8,0", // 6
          "10,5,2,0.5,0", // 7
          "8,4,1.5,0.4,0", // 8
          "5,2.5,1,0.3,0", // 9
          "4,2,0.8,0.2,0", // 10
          "3,1.5,0.5,0.2,0", // 11
          "2,1,0.4,0.1,0" // 12
        ].join(";");

        const initResponse = [
          `def_s=${defSymbols}`,
          `balance=${balance.toFixed(2)}`,
          `balance_cash=${balanceCash.toFixed(2)}`,
          `balance_bonus=0.00`,
          `c=${currentCoin}`,
          `defc=${currentCoin}`,
          `l=${currentLines}`,
          `sc=0.01,0.02,0.05,0.10,0.25,0.50,1.00,2.00,5.00`,
          `sh=5`,
          `sw=6`,
          `sver=5`,
          `counter=${counter}`,
          `index=${index}`,
          `stime=${stime}`,
          `na=s`,
          `reel0=${rStrip}`,
          `reel1=${rStrip}`,
          `reel2=${rStrip}`,
          `reel3=${rStrip}`,
          `reel4=${rStrip}`,
          `reel5=${rStrip}`,
          `paytable=${paytable}`,
          `scatters=1~100,20,5,0,0~10,10,10,0,0~1,1,1,0,0`,
          `wilds=2~0,0,0,0,0~0,0,0,0,0`
        ].join('&');

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(initResponse);
        return;
      }

      if (action === 'doSpin') {
        const c = parseFloat(params.c) || currentCoin;
        const l = parseInt(params.l) || currentLines;
        currentCoin = c;
        currentLines = l;
        currentBet = c * l;

        // Deduct bet
        balance -= currentBet;
        balanceCash -= currentBet;

        index++;
        counter++;

        const screenSymbols = getRandomGrid();
        const sStr = screenSymbols.join(',');

        // 35% chance to generate a win
        const isWin = Math.random() < 0.35;
        let win = 0.00;
        let winStr = '0.00';
        let nextAction = 's';

        if (isWin) {
          // Generate win multiplier between 1x and 8x bet
          const mult = Math.floor(Math.random() * 8) + 1;
          win = parseFloat((currentBet * mult).toFixed(2));
          winStr = win.toFixed(2);
          lastWin = win;
          nextAction = 'c'; // requires doCollect
        } else {
          lastWin = 0.00;
        }

        const spinResponse = [
          `balance=${balance.toFixed(2)}`,
          `balance_cash=${balanceCash.toFixed(2)}`,
          `balance_bonus=0.00`,
          `index=${index}`,
          `counter=${counter}`,
          `stime=${stime}`,
          `sh=5`,
          `sw=6`,
          `sver=5`,
          `sa=3,4,5,6,7,8`,
          `sb=3,4,5,6,7,8`,
          `s=${sStr}`,
          `w=${winStr}`,
          `win=${winStr}`,
          `c=${c}`,
          `l=${l}`,
          `na=${nextAction}`
        ].join('&');

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(spinResponse);
        return;
      }

      if (action === 'doCollect') {
        // Credit win to balance
        balance += lastWin;
        balanceCash += lastWin;
        lastWin = 0.00;

        index++;
        counter++;

        const collectResponse = [
          `balance=${balance.toFixed(2)}`,
          `balance_cash=${balanceCash.toFixed(2)}`,
          `balance_bonus=0.00`,
          `index=${index}`,
          `counter=${counter}`,
          `stime=${stime}`,
          `na=s`
        ].join('&');

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(collectResponse);
        return;
      }

      // Default fallback for any other action
      index++;
      counter++;
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`balance=${balance.toFixed(2)}&index=${index}&counter=${counter}&stime=${stime}&na=s`);
    });
    return;
  }

  // Static File Serving
  let relativePath = pathname;
  if (relativePath === '/' || relativePath === '') {
    relativePath = '/gs2c/html5Game.do';
  }

  // Remove query or hash already stripped by url.parse
  let filePath = path.join(PUBLIC_DIR, relativePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Check if file without extension or with .do exists
      console.warn(`File not found: ${filePath}`);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found: ' + pathname);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Pragmatic Play Slot Server running on port ${PORT}`);
  console.log(` Launcher URL: http://localhost:${PORT}/gs2c/html5Game.do?symbol=vs20wraanu&lang=fr&cur=USD`);
  console.log(`=======================================================`);
});
