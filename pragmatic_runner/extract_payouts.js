const fs = require('fs');
const raw = fs.readFileSync('d:/Slot Stake Engine/pragmatic_runner/public/gs2c/common/v3/games-html5/games/vs/vs20wraanu/desktop/game/game005.json', 'utf8');
for (let sym = 3; sym <= 12; sym++) {
  const target = '"Symbol' + sym + '"';
  let idx = raw.indexOf(target);
  if (idx !== -1) {
    let tIdx = raw.indexOf('_text":"', idx);
    let text = raw.slice(tIdx + 8, raw.indexOf('"', tIdx + 8));
    console.log('Symbol ' + sym + ' payouts: ' + JSON.stringify(text));
  }
}
