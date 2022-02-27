let modInfo = {
	name: "增量树宇宙ng-5",
	id: "???",
	author: "I",
	pointsName: "点数",
	discordName: "",
	discordLink: "",
	initialStartPoints: new ExpantaNum (0.001), // Used for hard resets and new players
	
	offlineLimit: 10,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "",
}

let changelog = `<h1>更新日志:</h1><br>
	<h3>v0.1</h3><br>
		- 更新了i层，p层<br>
		- 更新了4个成就和4个软上限
		- 当前残局：85增量可重复购买项数量.`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new ExpantaNum(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints()) return new ExpantaNum(0)
	let gain = new ExpantaNum(0.01)
	gain = gain.div(player.sc.debuff1)
	gain = gain.div(player.sc.debuff2)
	gain = gain.mul(player.p.b12eff)
	gain = gain.mul(player.p.points.add(10).log10().pow(player.p.b21eff))
	if (hasUpgrade("i",11)) gain = gain.mul(upgradeEffect("i",11))
	//gain = gain.mul(player.am.amEff)
	if (gain.gte(0.01)) gain = psc(gain,new ExpantaNum(0.01),new ExpantaNum(0.33))
	
	player.sc.pointsGain = gain
	gain = gain.mul(player.p.b11eff)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	function(){
        var db = `
		你有${format(player.p.antiPoints,4)}反点数，距离它超过点数还有${format(player.points.div(player.p.antiPoints).log10().mul(116.2767475).div(player.p.b11eff).mul(player.p.b23eff))}秒<br>
		${player.i.points.gte(0) ? `debuff1:基于距上次重置的时间削弱点数和增量获取 /${format(player.sc.debuff1)}<br>` : `debuff1:基于距上次重置的时间削弱点数获取 /${format(player.sc.debuff1)}<br>`}
		debuff2:基于点数削弱点数获取 /${format(player.sc.debuff2)}<br>
		`
		if (player.i.points.gt(0)) db = db + `debuff3:基于增量削弱增量获取 /${format(player.sc.debuff3)}<br>
		`
		var b = `p层速度:${format(player.p.b11eff)}x<br>
		`
		var key = shiftDown ? "已按下Shift键" : "当前残局：85增量可重复购买项数量"
		return db + b + key
	}
]

// Determines when the game "ends"
function isEndgame() {
	return getBuyableAmount("i",11).add(getBuyableAmount("i",12)).add(getBuyableAmount("i",13)).gte(85)
}



// Less important things beyond this point!

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(1) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}

var controlDown = false
var shiftDown = false

window.addEventListener('keydown', function(event) {
	if (event.keyCode == 16) shiftDown = true;
	if (event.keyCode == 17) controlDown = true;
}, false);

window.addEventListener('keyup', function(event) {
	if (event.keyCode == 16) shiftDown = false;
	if (event.keyCode == 17) controlDown = false;
}, false);