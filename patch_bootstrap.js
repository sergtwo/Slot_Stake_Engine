const fs = require('fs');
const file = 'D:/Slot Stake Engine/pragmatic_runner/public/gs2c/common/v3/games-html5/games/vs/vs20wraanu/desktop/bootstrap.js';
let content = fs.readFileSync(file, 'utf8');

const oldText = 'case "EVT_GET_CONFIGURATION":sendToGameInternal("EVT_GET_CONFIGURATION",{"config":gameConfig});return;';
const newText = 'case "EVT_GET_CONFIGURATION":if(isOnline){sendToAdapterOriginal(json);return;}sendToGameInternal("EVT_GET_CONFIGURATION",{"config":gameConfig});return;';

if (content.includes(oldText)) {
    content = content.replace(oldText, newText);
    fs.writeFileSync(file, content, 'utf8');
    console.log('SUCCESSFULLY PATCHED bootstrap.js!');
} else {
    console.log('NOT FOUND, checking index:');
    console.log(content.indexOf('EVT_GET_CONFIGURATION'));
}
