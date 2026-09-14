const fs = require('fs');
let html = fs.readFileSync('d:/Slot Stake Engine/pragmatic_runner/public/gs2c/html5Game.do.original', 'utf8');

const adapterCode = `
    window.sendToAdapter = function(json) {
        console.info("sendToAdapter (mock):", json);
        try {
            var params = JSON.parse(json);
            if (params.common === "EVT_GET_CONFIGURATION" || params.Notify === "evtGetConfiguration") {
                var localConfig = {
                    datapath: "/gs2c/common/v3/games-html5/games/vs/vs20wraanu/",
                    datapath_alternative: "/gs2c/common/v3/games-html5/games/vs/vs20wraanu/",
                    gameService: window.location.protocol + "//" + window.location.host + "/gs2c/ge/v5/gameService",
                    symbol: "vs20wraanu",
                    lang: "fr",
                    currency: "USD",
                    styleName: "rare_stake",
                    brandRequirements: "NOGA",
                    jurisdictionRequirements: "",
                    demoMode: "1",
                    accountType: "R",
                    sessionKeyV2: [
                        "MUly37eyoaPCUt9GJ3r+lqmm5mhWe1jiOybWg6GR/2fLUhqUITSd4pGqbR/p2RZmcbhiAjpqqP4uY2DK5K7nm/miTUfQDZeQJSZcFjMPUkaN5IqEPl9Tcw0f/ySbJ+FBm/3Z5LBgAngVD8kdXR6sEA+doWvB5qxULGkBVyk5pPE=",
                        "Ww19O+ZWF55AXYaIpkTXHJMsm9cQF5I9hLac1fzkyA+NS0zxZ9YSN2nEkpnMdAOVq+NTuD4qvDaRu8KQ4uQvpG69OlNSOgPdKIwYEMw1gCDixJKSD6k5Cz+ecSKeQA9z96tO1M1OwRUWBtpwZLwh6byr7hfKfjP34hp+TJM5tpw="
                    ]
                };
                if (window.sendToGame) {
                    window.sendToGame(JSON.stringify({
                        common: "EVT_GET_CONFIGURATION",
                        args: { config: localConfig },
                        Notify: "evtGetConfiguration",
                        Arguments: { Config: localConfig }
                    }));
                }
            } else if (params.common === "EVT_LOADING_PROGRESS" || params.common === "EVT_UPDATE_LOADING_PROGRESS") {
                var pct = (params.args && params.args.progress !== undefined) ? params.args.progress : 100;
                var lb = document.getElementById("loadingBar");
                if (lb) lb.style.width = pct + "%";
            } else if (params.common === "EVT_GAME_LOADED" || params.common === "EVT_GAME_LOAD_COMPLITED" || params.common === "EVT_START_GAME" || params.common === "EVT_HIDE_SPLASH" || params.Notify === "evtGameLoaded") {
                var sl = document.getElementById("ScaleRootLoading");
                if (sl) sl.style.display = "none";
                var ph = document.getElementById("pplogo");
                if (ph) ph.style.display = "none";
                var holder = document.querySelector(".loading-holder");
                if (holder) holder.style.display = "none";
            }
        } catch(e) {
            console.error("adapter error:", e);
        }
    };
`;

// 1. Skip external operator logo request that 404s
html = html.replace('UHTLogotype.LoadLogoInfo(args["config"]["styleName"])', 'Loader.LoadGame()');

// 2. Mock sendToAdapter and enable logs precisely in Loader.Start
html = html.replace('Loader.Start=function(){UHTConsole.AllowToWrite(false);', 'Loader.Start=function(){UHTConsole.AllowToWrite(true);' + adapterCode);

// 3. Mock Html5GameManager so Html5GameManager.init(...) succeeds
const managerMock = `
<script type="text/javascript">
window.Html5GameManager = {
    init: function(opts) {
        console.log("Html5GameManager.init called with options:", opts);
    }
};
</script>
`;
html = html.replace('<script type="text/javascript" src="https://demogamesfree.gfocgrfotg.net/gs2c/common/js/html5-script-external.js"></script>', managerMock);

// 4. Protect late window.sendToGame overwrite
const oldLateSendToGame = `window.sendToGame = function(data)
{
	var message = JSON.parse(data);
	var req = message.args.config.jurisdictionRequirements + "" + message.args.config.brandRequirements;
	if (req.indexOf("NOGA") != -1)
		noga = true;
}`;

const newLateSendToGame = `var previousSendToGame = window.sendToGame;
window.sendToGame = function(data)
{
	try {
		var message = JSON.parse(data);
		if (message && message.args && message.args.config) {
			var req = (message.args.config.jurisdictionRequirements || "") + "" + (message.args.config.brandRequirements || "");
			if (req.indexOf("NOGA") != -1)
				noga = true;
		}
	} catch(e) {}
	if (typeof previousSendToGame === "function")
		previousSendToGame(data);
}`;
html = html.replace(oldLateSendToGame, newLateSendToGame);

fs.writeFileSync('d:/Slot Stake Engine/pragmatic_runner/public/gs2c/html5Game.do', html);
console.log('Successfully updated html5Game.do with bidirectional sendToAdapter support!');
