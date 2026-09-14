const fs = require('fs');

console.log('Reading HAR file...');
const harRaw = fs.readFileSync('d:/Slot Stake Engine/stake.bet.har', 'utf8');
const har = JSON.parse(harRaw);

const entries = har.log.entries;
console.log('Total entries:', entries.length);

const relevant = [];
for (const entry of entries) {
  const url = entry.request.url;
  if (url.includes('gameService') || url.includes('saveSettings') || url.includes('html5Game') || url.includes('meta.html') || url.includes('customizations')) {
    relevant.push({
      url: url,
      method: entry.request.method,
      postData: entry.request.postData ? entry.request.postData.text : null,
      status: entry.response.status,
      response: entry.response.content ? entry.response.content.text : null
    });
  }
}

console.log(`Found ${relevant.length} relevant entries.`);
fs.writeFileSync('d:/Slot Stake Engine/pragmatic_runner/har_game_traffic.json', JSON.stringify(relevant, null, 2));

for (const item of relevant) {
  console.log(`\n--- [${item.method}] ${item.url} (Status: ${item.status}) ---`);
  if (item.postData) {
    console.log('POST DATA:', item.postData);
  }
  if (item.response) {
    console.log('RESPONSE:', item.response.substring(0, 400) + (item.response.length > 400 ? '...' : ''));
  }
}
