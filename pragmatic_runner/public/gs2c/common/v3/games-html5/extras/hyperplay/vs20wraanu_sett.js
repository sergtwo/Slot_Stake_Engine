HPVARS.mainColor = "#064121";
HPVARS.colorTheme = "teal";

// -----------------------------------------------------------------------------
// BUY FEATURE
// -----------------------------------------------------------------------------
HPVARS.featureRootPath = "UI Root/XTRoot/Root/Game/Main/GameFeatures/FeaturePurchase/ConfirmPurchaseWindow/content/Options/";
HPVARS.featureLabelsPaths = [
	"Option1/content/Texts/Name/Label",
	"Option2/content/Texts/Name/Label",
	"Option3/content/Texts/Name/Label",
	"Option4/content/Texts/Name/Label",
	"Option5/content/Texts/Name/Label"
];
HPVARS.featureDescPaths = [
	"Option1/content/Texts/Description/Label",
	"Option2/content/Texts/Description/Label",
	"Option3/content/Texts/Description/Label",
	"Option4/content/Texts/Description/Label",
	"Option5/content/Texts/Description/Label"
];
HPVARS.useCollidersForBF = false;

// -----------------------------------------------------------------------------
// ANTEBET / SPECIAL BET TIERS
// -----------------------------------------------------------------------------

HPVARS.settingsV2 = true;

HPVARS.anteBetRootPath = "UI Root/XTRoot/Root/Game/Main/GameFeatures/AnteBet/";

HPVARS.anteBetLabelsPaths = [
	"MainButton/content/Visual/Landscape/MainLevel0/Name/Label", // SPECIAL BETS
	"WindowOptions/content/Options/Level1/content/Text/Name/Label",
	"WindowOptions/content/Options/Level2/content/Text/Name/Label",
	"WindowOptions/content/Options/Level3/content/Text/Name/Label",
	
]

HPVARS.anteBetDescPaths = [
	"",
	"WindowOptions/content/Options/Level1/content/Text/Description/Label",
	"WindowOptions/content/Options/Level2/content/Text/Description/Label",
	"WindowOptions/content/Options/Level3/content/Text/Description/Label",
]

// -----------------------------------------------------------------------------
// ADDITIONAL FREE SPINS SOUND
// -----------------------------------------------------------------------------

HPVARS.playSoundOnAdditionalFS = 1;


// -----------------------------------------------------------------------------
// GAMBLE FEATURE
// -----------------------------------------------------------------------------

HPVARS.waitForFSOptions = true;
HPVARS.Gamble = {};
HPVARS.Gamble.propNames = ["r8x", "r16x", "r32x", "r64x", "r128x"];

HPVARS.Gamble.gambleColliderClass = CATButton;
HPVARS.Gamble.rootPath = "UI Root/XTRoot/Root/";

HPVARS.Gamble.gamblePaths = ["Game/Main/Reels/Bonus/Pivot/Wheel/Buttons/PressToGamble"];
HPVARS.Gamble.collectPath = "Game/Main/Reels/Bonus/Pivot/Collect_button";

if (Globals.isMobile) {
	HPVARS.Gamble.titlePaths = ['UI Root/XTRoot/Root/Paytable_mobile/Paytable_portrait/Page4/Content/RealContent/TumbleMultipliersHolder/TitleHolder/Title'];
	HPVARS.Gamble.optionPaths = ["UI Root/XTRoot/Root/GUI_mobile/Interface_Landscape/ContentInterface/BottomBar/DynamicInfoBar/FreeSpins/FreeSpinsLeftAndMultiplier/FSMultiplier/FSMultiplierHideWin/MultiplierLabel"];
	HPVARS.Gamble.winPath = HPVARS.Gamble.rootPath + "GUI_mobile/GambleRoot/Content/ProgressInfo/Win_Info/WinLabel";
	HPVARS.Gamble.losePath = HPVARS.Gamble.rootPath + "GUI_mobile/GambleRoot/ResultWindow/ResultLost/Content/Texts/Title/GambleLostTitleLabel";
} else {
	HPVARS.Gamble.titlePaths = ['UI Root/XTRoot/Root/Paytable/Pages/Page2/TumbleMultipliersHolder/TitleHolder/Title'];
	HPVARS.Gamble.optionPaths = ["UI Root/XTRoot/Root/GUI/Interface/TopBar/DynamicMessageZone/DynamicContent/FreeSpin/FreeSpinsLeftAndMultiplier/Multiplier/MultiplierHideWin/FreeSpinsMultiplierLabel"];
	HPVARS.Gamble.winPath = HPVARS.Gamble.rootPath + "GUI/GambleRoot/Content/GambleInfo/Win_Info/WinLabel";
	HPVARS.Gamble.losePath = HPVARS.Gamble.rootPath + "GUI/GambleRoot/ResultWindow/ResultLost/Content/Texts/Title/GambleLostTitleLabel";

}

//UI Root/XTRoot/Root/Game/Main/Reels/Bonus/Pivot/BonusText/TextTop/Label: 
//"GAMBLE FOR HIGHER STARTING MULTIPLIER"

HPVARS.Gamble.fsKey = "gm"; //ngm
HPVARS.Gamble.tryKey = "none";
HPVARS.Gamble.baseNo = 8;
HPVARS.Gamble.max = 256;
HPVARS.Gamble.step = 2;
HPVARS.Gamble.isMultiplier = true;
HPVARS.Gamble.fsCount = 10;
