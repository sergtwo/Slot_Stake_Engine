const fs = require('fs');
const content = fs.readFileSync('d:/Slot Stake Engine/pragmatic_runner/public/gs2c/common/v3/games-html5/games/vs/vs20wraanu/desktop/build.js', 'utf8');
console.log('build.js length:', content.length);

const keywords = ['action=do', 'doInit', 'doSpin', 'doCollect', 'gameService', 'balance_cash', 'def_s', 'index=', 'counter=', 'saveSettings'];
keywords.forEach(k => {
  let idx = 0;
  let count = 0;
  while ((idx = content.indexOf(k, idx)) !== -1) {
    count++;
    if (count <= 3) {
      console.log(`Found [${k}] at index ${idx}:`);
      console.log('Context:', content.substring(Math.max(0, idx - 60), Math.min(content.length, idx + 120)));
    }
    idx += k.length;
  }
  console.log(`Total occurrences of [${k}]: ${count}\n`);
});
