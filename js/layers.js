function psc(num,st,eff){
    return num.div(new ExpantaNum(st)).pow(new ExpantaNum(eff)).mul(new ExpantaNum(st))

}
addLayer("ach",{
    name: "achievements", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    row:"side",
    startData() { return {
        points: new ExpantaNum(0),
        pointsGain: new ExpantaNum(0),
        //a11: false,
        //a12: false,
        //a13: false,
        //a14: true
    }},
    color: "#FFFF00",
    resource: "成就", // Name of prestige currency
    gainMult() { // Calculate the multiplier for main currency from bonuses
        player.ach.points = new ExpantaNum(player.ach.achievements.length)
        return new ExpantaNum(1)
    },
    
    tabFormat: {
        "成就": {
            content :[
                "main-display",
                "achievements"
            ]
        },
    },
    achievements: {
        11: {
            name: "这是一句假话",
            tooltip: "获得1悖论次数",
            done() { return player.p.points.gte(1)},
            image: "images/a11.png"
        }, 
        12: {
            name: "我在玩增量宇树宙吗？",
            tooltip: "获得1增量",
            done() { return player.i.points.gte(1)},
            image: "images/a12.png"
        }, 
        13: {
            name: "软上限一定是debuff吗？",
            tooltip: "获得1个debuff软上限",
            done() { return player.sc.debuff2.gte(64)},
            image: "images/a13.png"
        }, 
        14: {
            name: "虫洞",
            tooltip: "拥有6级“时间加快2倍(p层级以下)”",
            done() { return getBuyableAmount("p",11).gte(6)},
            //image: "images/a13.png"
        }, 
    },
})

addLayer("sc",{
    name: "softcap", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SC", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    row:"side",
    startData() { return {
        points: new ExpantaNum(0),
        pointsGain: new ExpantaNum(0),
        debuff1:new ExpantaNum(1),
        debuff2:new ExpantaNum(1),
        debuff3:new ExpantaNum(1),
        p1: false,
        i1: false,
        i2: false,
        d1: false,

    }},
    color: "#FFFFFF",
    resource: "软上限", // Name of prestige currency
    gainMult() { // Calculate the multiplier for main currency from bonuses
        player.sc.debuff1 = player.p.time.div(4).add(1).pow(player.p.b13eff)

        player.sc.debuff2 = player.points.mul(100).add(1).pow(player.p.b14eff)
        if (player.sc.debuff2.gte(64)) player.sc.debuff2 = psc(player.sc.debuff2,64,3)

        player.sc.debuff3 = player.i.points.add(1).pow(0.5).pow(player.p.b24eff)

        player.sc.points = new ExpantaNum(0)
        if (player.sc.pointsGain.gte(0.01) || player.sc.p1 == true) player.sc.points = player.sc.points.add(1);player.sc.p1 = true
        if (player.i.inGain.div(player.p.b11eff).gte(1) || player.sc.i1 == true) player.sc.points = player.sc.points.add(1);player.sc.i1 = true
        if (player.i.inGain.div(player.p.b11eff).gte(1024) || player.sc.i2 == true) player.sc.points = player.sc.points.add(1);player.sc.i2 = true
        if (player.sc.debuff2.gte(64) || player.sc.d1 == true) player.sc.points = player.sc.points.add(1);player.sc.d1 = true
        return new ExpantaNum(1)
    },
    tabFormat: [
        "main-display",
        "blank",
        
        ["display-text", function() {return `点数软上限` },
            { "font-size":"22px"}],
        ["display-text", function() {return player.sc.pointsGain.gte(0.01) || player.sc.p1 ? '点数软上限1: 点数获取^0.33，开始于0.01/s(不含时间速度)' : ''}],
        "blank",
        ["display-text", function() {return `增量软上限` },
            { "font-size":"22px"}],
        ["display-text", function() {return player.i.inGain.div(player.p.b11eff).gte(new ExpantaNum(1)) || player.sc.i1? '增量软上限1: 增量获取^0.5，开始于1/s(不含时间速度)' : ''}],
        ["display-text", function() {return player.i.inGain.div(player.p.b11eff).gte(new ExpantaNum(1)) || player.sc.i2? '增量软上限2: 增量获取^0.33，开始于1024/s(不含时间速度)' : ''}],
        "blank",
        ["display-text", function() {return `debuff软上限` },
            { "font-size":"22px"}],
        ["display-text", function() {return player.sc.debuff2.gte(new ExpantaNum(64)) || player.sc.d1? 'debuff2软上限1: debuff2效果^3，开始于/64' : ''}],
    ],
    update(diff) {
        
    }
})

addLayer("i", {
    name: "Incremently", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "I", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        //part1
        unlocked: true,
		points: new ExpantaNum(0),
        bests: new ExpantaNum(0),
        ds: false,
        ku24: false,
        inGain: new ExpantaNum(0),
        u11eff: new ExpantaNum(1),
        u12eff: new ExpantaNum(1),
        controlDown: false,
        shiftDown: false,
        
    }},
    color: "#4b4c83",
    requires: new ExpantaNum(10), 
    resource: "增量", // Name of prestige currency
    baseResource: "点数",
    baseAmount() {return player.points}, 
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new ExpantaNum(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
       

    window.addEventListener('keydown', function(event) {
	    if (event.keyCode == 16) player.i.shiftDown = true;
    	if (event.keyCode == 17) player.i.controlDown = true;
    }, false);

    window.addEventListener('keyup', function(event) {
    	if (event.keyCode == 16) player.i.shiftDown = false;
    	if (event.keyCode == 17) player.i.controlDown = false;
    }, false);
        
        player.i.bests = player.i.bests.gte(player.i.points) ? player.i.bests : player.i.points
        
        //buyableEffect("i",11) = new ExpantaNum(1.5).pow(getBuyableAmount("i",11))
        //buyableEffect("i",12) = new ExpantaNum(2).pow(getBuyableAmount("i",12))
        //buyableEffect("i",13) = new ExpantaNum(1.1).pow(getBuyableAmount("i",13))
        //upgradeEffect("i",11) = hasUpgrade("i",21) ? hasUpgrade("i",24) ? player.i.bests.add(1) : player.i.points.add(1) : hasUpgrade("i",24) ? player.i.bests.add(1).pow(0.5) : player.i.points.add(1).pow(0.5)
        //upgradeEffect("i",11) = new ExpantaNum(1.1).pow(player.i.upgrades.length)
        

        player.i.ku24 = hasUpgrade("i",24) ? true : player.i.k24
        return new ExpantaNum(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)  QwQ:1也可以当第一排
    effectDescription() {
        if (player.points.gte(1) || player.i.ds) {
            player.i.ds = true;
            return "将反点数除以 " + format(player.i.points.add(1))
        } else {
            return "你至少拥有1点数才能获得增量"
        }
    },
    tabFormat: {
        "主菜单":{
            content: [
                "main-display",
                "blank",
		        ["display-text", function() {return `你每秒获得${format(player.i.inGain)}增量` },
                    { "font-size":"22px"}],
		        ["display-text", function() {return getBuyableAmount("i",11).lt(3) ? '你需要 4 个增量速度以解锁下一个升级' : getBuyableAmount("i",12).lt(3) ? '你需要 3 个增量强度以解锁下一个升级' : getBuyableAmount("i",11).lt(9) ? '你需要 9 个增量速度以解锁下一个升级' : getBuyableAmount("i",12).lt(5) ? '你需要 5 个增量强度以解锁下一个升级' : getBuyableAmount("i",11).lt(41) ? '你需要 41 个增量强度以解锁下一个升级' : getBuyableAmount("i",12).lt(8) ? '你需要 8 个增量强度以解锁下一个升级' : getBuyableAmount("i",11).lt(45) ? '你需要 45 个增量速度以解锁下一个升级' : ''}],
		        "blank",
                "buyables",
                "blank",
                "upgrades",
            ],
        },
        "详情":{
            content: [
                "main-display",
                ["display-text", function(){ return "增量基础获得量的公式是 log10(点数)+1, 低于1点数时为零，"}],
                ["display-text", function(){ return "这一数字受debuff和p购买项的影响，效果为累乘，"}],
                ["display-text", function(){ return "这一数字受i购买项11、12的影响，效果为累乘，"}],
                ["display-text", function(){ return getBuyableAmount("i", 13).gt(0) ? "然后这一数量变为它的“增量耐性”次方，" : ""}],
                ["display-text", function(){ return "再然后受提高增量获得量的升级的影响，效果为累乘。"}],
                ["display-text", function(){ return "最后受软上限的影响，效果为累乘。"}],
                ["display-text", function(){ return "最最后受时间速度的影响。"}],
            ],
            unlocked(){
                return true
            },
        },
    },
    //clickables: {
        //part1
        //11: {
        //    canClick(){return true},
        //    display() {return `Update the game<br />You've updated ${Utimeformat(player.u.updtime)}.<br /><br />Now you are doing:${updtxt[player.u.doing]}`},
        //    onClick(){player.u.doing = "upd"}
        //},
    //},
    buyables: {
        11: {
            unlocked() { return hasUpgrade("i",12)},
            title:"增量速度",
            display() {
                var amount = `<br>数量: ${format(getBuyableAmount("i",11))}<br>`
                var eff = `效果: *${format(buyableEffect("i",11))}`
                var cost = `<br>价格: ${format(this.cost())}增量`
                var shift = `<br>${player.i.shiftDown ? hasUpgrade("i",22) ? "价格公式: 10*0.99^x*1.01^x^2<br>效果公式: 1.5^x" : "价格公式: 10*1.98^x*1.01^x^2<br>效果公式: 1.5^x" : "按住Shift键查看详情"}`
                return amount + eff + cost + shift
            },
            cost() {return hasUpgrade("i",22) ? new ExpantaNum(10).mul(new ExpantaNum(0.99).pow(getBuyableAmount("i",11))).mul(new ExpantaNum(1.01).pow(getBuyableAmount("i",11).pow(2))) : new ExpantaNum(10).mul(new ExpantaNum(1.98).pow(getBuyableAmount("i",11))).mul(new ExpantaNum(1.01).pow(getBuyableAmount("i",11).pow(2)))},
            canAfford() { return player.i.points.gte(this.cost()) },
            buy() {
                player.i.points = player.i.points.sub(this.cost())
                setBuyableAmount("i",11,getBuyableAmount("i",11).add(1))
            },
            effect() {
                let eff = new ExpantaNum(1.5).pow(getBuyableAmount("i",11))
                return eff;
            },
            style() {
                return {"height":"180px","width":"180px"}
            },
        },
        12: {
            unlocked() { return hasUpgrade("i",13)},
            title:"增量强度",
            display() {
                var amount = `<br>数量: ${format(getBuyableAmount("i",12))}<br>`
                var eff = `效果: *${format(buyableEffect("i",12))}`
                var cost = `<br>价格: ${format(this.cost())}增量`
                var shift = `<br>${player.i.shiftDown ? hasUpgrade("i",23) ? "价格公式: 100*1.25^x^2<br>效果公式: 2^x" : "价格公式: 100*3.2^x*1.25^x^2<br>效果公式: 2^x" : "按住Shift键查看详情"}`
                return amount + eff + cost + shift
            },
            cost() {return hasUpgrade("i",23) ? new ExpantaNum(100).mul(new ExpantaNum(1.25).pow(getBuyableAmount("i",12).pow(2))) : new ExpantaNum(100).mul(new ExpantaNum(3.2).pow(getBuyableAmount("i",12))).mul(new ExpantaNum(1.25).pow(getBuyableAmount("i",12).pow(2)))},
            canAfford() { return player.i.points.gte(this.cost()) },
            buy() {
                player.i.points = player.i.points.sub(this.cost())
                setBuyableAmount("i",12,getBuyableAmount("i",12).add(1))
            },
            effect() {
                let eff = new ExpantaNum(2).pow(getBuyableAmount("i",12))
                return eff;
            },
            style() {
                return {"height":"180px","width":"180px"}
            },
        },
        13: {
            unlocked() { return hasUpgrade("i",14)},
            title:"增量耐性",
            display() {
                var amount = `<br>数量: ${format(getBuyableAmount("i",13))}<br>`
                var eff = `效果: ^${format(buyableEffect("i",13))}`
                var cost = `<br>价格: ${format(this.cost())}增量`
                var shift = `<br>${player.i.shiftDown ? hasUpgrade("i",24) ? hasUpgrade("i",31) ? "价格公式: 100*1.25^(x/1.5)^2*1.1^1.2^x <br>效果公式: 1.1^x(时间加成前)" : "价格公式: 100*1.25^x^2*1.1^1.2^x <br>效果公式: 1.1^x(时间加成前)" : "价格公式: 100*2^x*1.25^x^2*1.1^1.2^x <br>效果公式: 1.1^x(时间加成前)" : "按住Shift键查看详情"}`
                return amount + eff + cost + shift
            },
            cost() {return hasUpgrade("i",24) ? hasUpgrade("i",31) ? new ExpantaNum(100).mul(new ExpantaNum(1.25).pow(getBuyableAmount("i",13).div(1.5).pow(2))).mul(new ExpantaNum(1.1).pow(new ExpantaNum(1.2).pow(getBuyableAmount("i",13)))) : new ExpantaNum(100).mul(new ExpantaNum(1.25).pow(getBuyableAmount("i",13).pow(2))).mul(new ExpantaNum(1.1).pow(new ExpantaNum(1.2).pow(getBuyableAmount("i",13)))) : new ExpantaNum(100).mul(new ExpantaNum(2).pow(getBuyableAmount("i",13))).mul(new ExpantaNum(1.25).pow(getBuyableAmount("i",13).pow(2))).mul(new ExpantaNum(1.1).pow(new ExpantaNum(1.2).pow(getBuyableAmount("i",13))))},
            canAfford() { return player.i.points.gte(this.cost()) },
            buy() {
                player.i.points = player.i.points.sub(this.cost())
                setBuyableAmount("i",13,getBuyableAmount("i",13).add(1))
            },
            effect() {
                let eff = new ExpantaNum(1.1).pow(getBuyableAmount("i",13))
                return eff;
            },
            style() {
                return {"height":"180px","width":"180px"}
            },
        },
    },

    upgrades: {
        11: {
            title: "Cache",
            description() {return "点数获得量乘以(增量数量+1)的平方根<br>当前效果: *" + format(upgradeEffect("i",11)) },
            cost(){return new ExpantaNum(2)},
            effect() {return hasUpgrade("i",21) ? hasUpgrade("i",24) ? player.i.bests.add(1) : player.i.points.add(1) : hasUpgrade("i",24) ? player.i.bests.add(1).pow(0.5) : player.i.points.add(1).pow(0.5)},
            unlocked(){return true},
        },
        12: {
            title: "Cash",
            description() {return "解锁一个可重复购买项，每购买一个升级，增量获得量乘1.1<br>当前效果: *" + format(upgradeEffect("i",12)) },
            cost(){return new ExpantaNum(30)},
            effect() {return new ExpantaNum(1.1).pow(player.i.upgrades.length)},
            unlocked(){return hasUpgrade("i",11) || hasUpgrade("i",12)},
        },
        13: {
            title: "Raze",
            description() {return "解锁第二个可重复购买项" },
            cost(){return new ExpantaNum(100)},
            unlocked(){return getBuyableAmount("i",11).gte(4) || hasUpgrade("i",13)},
        },
        14: {
            title: "Raise",
            description() {return "解锁第三个可重复购买项" },
            cost(){return new ExpantaNum(0)},
            unlocked(){return getBuyableAmount("i",12).gte(3) || hasUpgrade("i",14)},
        },
        21: {
            title: "Faze",
            description() {return "Cache的效果变为原来的平方" },
            cost(){return new ExpantaNum(5000)},
            unlocked(){return getBuyableAmount("i",11).gte(9) || hasUpgrade("i",21)},
        },
        22: {
            title: "Phase",
            description() {return "移除\"增量速度\"的线性增长" },
            cost(){return new ExpantaNum(372529)},
            unlocked(){return getBuyableAmount("i",12).gte(5) || hasUpgrade("i",22)},
        },
        23: {
            title: "Flower",
            description() {return "移除\"增量强度\"的线性增长" },
            cost(){return new ExpantaNum(50000000)},
            unlocked(){return getBuyableAmount("i",11).gte(41) || hasUpgrade("i",23)},
        },
        24: {
            title: "Flour",
            description() {return "移除\"增量耐性\"的线性增长，同时Cache的效果由增量数量的最大值决定，且不会被悖论层重置" },
            cost(){return new ExpantaNum(50000000)},
            unlocked(){return getBuyableAmount("i",12).gte(8) || hasUpgrade("i",24)},
        },
        31: {
            title: "Kernel",
            description() {return "削弱\"增量耐性\"的二次指数增长(需要购买升级24才能生效)" },
            cost(){return new ExpantaNum(50000000)},
            unlocked(){return getBuyableAmount("i",11).gte(45) || hasUpgrade("i",31)},
        },
    },
    /*
    challenges: {
        11: {
            name: "AntiLooperrrr",
            challengeDescription: "因为挑战出了bug，devU13被禁用了。刷新后的第一帧时间计数x100。",
            canComplete(){return player.points.gte(1e10)},
            goalDescription(){return format(ExpantaNum(1e10))+"点数"},
            rewardDisplay(){return `你永远保留dev11的效果，同时“刷新后的第一帧时间计数x100。”被保留。`},
            unlocked(){return hasUpgrade("dev",15)}
        },
    },
    */

    update(diff){
        //增量获取
        player.i.inGain = player.points.log10().add(1).max(0)
        //debuffs and p buyables
        player.i.inGain = player.i.inGain.div(player.sc.debuff1)
        player.i.inGain = player.i.inGain.div(player.sc.debuff3)
        player.i.inGain = player.i.inGain.mul(player.p.b22eff)
        //i buyables
        player.i.inGain = player.i.inGain.mul(buyableEffect("i",11))
        player.i.inGain = player.i.inGain.mul(buyableEffect("i",12))
        player.i.inGain = player.i.inGain.pow(buyableEffect("i",13))
        //upgrades
        if (hasUpgrade("i",12)) player.i.inGain = player.i.inGain.mul(upgradeEffect("i",12))
        if (hasUpgrade("p",12)) player.i.inGain = player.i.inGain.mul(player.p.u12eff)
        //player.i.inGain = player.i.inGain.mul(player.am.powEff)//antimatter
        //softcap
        if (player.i.inGain.gte(1)) player.i.inGain = player.i.inGain.pow(0.5)
        if (player.i.inGain.gte(1024)) player.i.inGain = player.i.inGain.div(1024).pow(0.33).mul(1024)
        //time
        player.i.inGain = player.i.inGain.mul(player.p.b11eff)
        
        player.i.inGain = player.i.inGain.mul(player.points.gte(1) ? 1 : 0)
        player.i.points = player.i.points.add(player.i.inGain.mul(diff))
    },
    layerShown(){return true}
})
addLayer("p", {
    name: "Paradox", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    branches:["i"],
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        //part1
        unlocked: true,
		points: new ExpantaNum(0),
        ls: false,
        time: new ExpantaNum(0),
        lastAntiPoints: new ExpantaNum(0.0005),
        antiPoints:new ExpantaNum(0.0005),
        b11eff: new ExpantaNum(1),
        b12eff: new ExpantaNum(1),
        b13eff: new ExpantaNum(1),
        b14eff: new ExpantaNum(1),
        b21eff: new ExpantaNum(0),
        b22eff: new ExpantaNum(1),
        b23eff: new ExpantaNum(1),
        b24eff: new ExpantaNum(1),
        u12eff: new ExpantaNum(1),
    }},
    color: "#FF00FF",
    requires: new ExpantaNum(0.1), 
    resource: "悖论次数", // Name of prestige currency
    baseResource: "点数",
    baseAmount() {return player.points}, 
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 2,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new ExpantaNum(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        if (player.p.antiPoints.gte(player.points)) {
            //重置i层内容
            player.points = new ExpantaNum(0.001);
            player.p.time = new ExpantaNum(0);
            player.p.lastAntiPoints = new ExpantaNum(0.0005)
            player.p.antiPoints = new ExpantaNum(0.0005);
            player.i.points = new ExpantaNum(0)
            player.p.points = player.p.points.add(1)
            player.i.upgrades = player.i.ku24 ? [24] : []
            setBuyableAmount("i",11,new ExpantaNum(0))
            setBuyableAmount("i",12,new ExpantaNum(0))
            setBuyableAmount("i",13,new ExpantaNum(0))
            //重置am层维度
            player.am.inPow = new ExpantaNum(0)
            for (var i = 0; i <= 3; i++) {
                player.am.dimAmt[i] = (getBuyableAmount("am",11+i))
            }
        }
        player.p.b11eff = new ExpantaNum(2).pow(getBuyableAmount("p",11))
        player.p.b12eff = new ExpantaNum(2).pow(getBuyableAmount("p",12))
        player.p.b13eff = new ExpantaNum(0.9).pow(getBuyableAmount("p",13))
        player.p.b14eff = new ExpantaNum(0.9).pow(getBuyableAmount("p",14))
        player.p.b21eff = new ExpantaNum(0.5).mul(getBuyableAmount("p",21))
        player.p.b22eff = new ExpantaNum(2).pow(getBuyableAmount("p",22))
        player.p.b23eff = new ExpantaNum(2).pow(getBuyableAmount("p",23).div(4))
        player.p.b24eff = new ExpantaNum(0.9).pow(getBuyableAmount("p",24))
        player.p.u12eff = player.p.points.add(1).log10().add(1)
        return new ExpantaNum(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)  QwQ:1也可以当第一排
    clickables: {
        //11: {
        //    canClick(){return true},
        //    display() {return `make your paradoxes time 2`},
        //    onClick(){player.p.points = player.p.points.mul(2)}
        //},
    },
    buyables: {
        11: {
            unlocked() { return true},
            cost() { 
                return new ExpantaNum(2).pow(new ExpantaNum(2).pow(getBuyableAmount("p",11)))
            },
            display() { return "时间加快2倍(p层级及以下)<br>当前数量:" + format(getBuyableAmount("p", 11)) + "<br>当前效果: *" + format(new ExpantaNum(2).pow(getBuyableAmount("p",11))) + "<br>价格:" + format(this.cost()) +"悖论次数" },
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount("p", 11, getBuyableAmount("p", 11).add(1))
            },
            style() {
                return {"height":"120px","width":"120px"}
            },
        },
        12: {
            unlocked() { return true},
            cost() { 
                return new ExpantaNum(2).pow(getBuyableAmount("p",12).pow(1.75))
            },
            display() { return "点数获取*2<br>当前数量:" + format(getBuyableAmount("p", 12)) + "<br>当前效果: *" + format(new ExpantaNum(2).pow(getBuyableAmount("p",12))) + "<br>价格:" + format(this.cost()) +"悖论次数" },
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount("p", 12, getBuyableAmount("p", 12).add(1))
            },
            style() {
                return {"height":"120px","width":"120px"}
            },
        },
        13: {
            unlocked() { return true},
            cost() { 
                return new ExpantaNum(2).pow(new ExpantaNum(2).pow(getBuyableAmount("p",13).div(1.1).add(0.5)))
            },
            display() { return "削弱debuff1至^0.9<br>当前数量:" + format(getBuyableAmount("p", 13)) + "<br>当前效果: ^" + format(new ExpantaNum(0.9).pow(getBuyableAmount("p",13))) + "<br>价格:" + format(this.cost()) +"悖论次数" },
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount("p", 13, getBuyableAmount("p", 13).add(1))
            },
            style() {
                return {"height":"120px","width":"120px"}
            },
        },
        14: {
            unlocked() { return true},
            cost() { 
                return new ExpantaNum(2).pow(new ExpantaNum(2).pow(getBuyableAmount("p",14))).mul(4);
            },
            display() { return "削弱debuff2至^0.9<br>当前数量:" + format(getBuyableAmount("p", 14)) + "<br>当前效果: ^" + format(new ExpantaNum(0.9).pow(getBuyableAmount("p",14))) + "<br>价格:" + format(this.cost()) +"悖论次数" },
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount("p", 14, getBuyableAmount("p", 14).add(1))
            },
            style() {
                return {"height":"120px","width":"120px"}
            },
        },
        21: {
            unlocked() { return true},
            cost() { 
                return new ExpantaNum(2).pow(getBuyableAmount("p",21).pow(2))
            },
            display() { return "点数获取*log10(悖论次数+10)^0.5<br>当前数量:" + format(getBuyableAmount("p", 21)) + "<br>当前效果: *" + format(player.p.points.add(10).log10().pow(player.p.b21eff)) + "<br>价格:" + format(this.cost()) +"悖论次数" },
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount("p", 21, getBuyableAmount("p", 21).add(1))
            },
            style() {
                return {"height":"120px","width":"120px"}
            },
        },
        22: {
            unlocked() { return true},
            cost() { 
                return new ExpantaNum(2048).mul(new ExpantaNum(2).pow(getBuyableAmount("p",22).pow(1.5)))
            },
            display() { return "增量获取*2<br>当前数量:" + format(getBuyableAmount("p", 22)) + "<br>当前效果: *" + format(new ExpantaNum(2).pow(getBuyableAmount("p",22))) + "<br>价格:" + format(this.cost()) +"悖论次数" },
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount("p", 22, getBuyableAmount("p", 22).add(1))
            },
            style() {
                return {"height":"120px","width":"120px"}
            },
        },
        23: {
            unlocked() { return true},
            cost() { 
                return new ExpantaNum(16384).mul(new ExpantaNum(2).pow(new ExpantaNum(2).pow(getBuyableAmount("p",23))))
            },
            display() { return "反点数增长速度变为它的1/2^0.25<br>当前数量:" + format(getBuyableAmount("p", 23)) + "<br>当前效果: /" + format(new ExpantaNum(2).pow(getBuyableAmount("p",23).div(4))) + "<br>价格:" + format(this.cost()) +"悖论次数" },
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount("p", 23, getBuyableAmount("p", 23).add(1))
            },
            style() {
                return {"height":"120px","width":"120px"}
            },
        },
        24: {
            unlocked() { return true},
            cost() { 
                return new ExpantaNum(524288).mul(new ExpantaNum(2).pow(new ExpantaNum(2).pow(getBuyableAmount("p",24))))
            },
            display() { return "削弱debuff3至^0.9<br>当前数量:" + format(getBuyableAmount("p", 24)) + "<br>当前效果: /" + format(new ExpantaNum(0.9).pow(getBuyableAmount("p",24))) + "<br>价格:" + format(this.cost()) +"悖论次数" },
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount("p", 24, getBuyableAmount("p", 24).add(1))
            },
            style() {
                return {"height":"120px","width":"120px"}
            },
        },
    },
    
    upgrades: {
        11: {
            description: "每一个增量购买项都将反点数除以1.5",
            cost(){return new ExpantaNum(4194304)},
            unlocked(){return getBuyableAmount("p",24).gte(1)},
        },
        12: {
            description() {return  "增量获得量乘以log(pp+1)+1(软上限前)<br>当前效果：*" + format(player.p.u12eff)},
            cost(){return new ExpantaNum(33554432)},
            unlocked(){return hasUpgrade("p",11)},
        },
    },
    
    /*
    challenges: {
        11: {
            name: "AntiLooperrrr",
            challengeDescription: "因为挑战出了bug，devU13被禁用了。刷新后的第一帧时间计数x100。",
            canComplete(){return player.points.gte(1e10)},
            goalDescription(){return format(ExpantaNum(1e10))+"点数"},
            rewardDisplay(){return `你永远保留dev11的效果，同时“刷新后的第一帧时间计数x100。”被保留。`},
            unlocked(){return hasUpgrade("dev",15)}
        },
    },
    */

    doReset(layer) {
        //重置i层内容
        player.points = new ExpantaNum(0.001);
        player.p.time = new ExpantaNum(0);
        player.p.lastAntiPoints = new ExpantaNum(0.0005)
        player.p.antiPoints = new ExpantaNum(0.0005);
        player.i.points = new ExpantaNum(0)
        player.i.upgrades = player.i.ku24 ? [24] : []
        setBuyableAmount("i",11,new ExpantaNum(0))
        setBuyableAmount("i",12,new ExpantaNum(0))
        setBuyableAmount("i",13,new ExpantaNum(0))
        //重置am层维度
        player.am.inPow = new ExpantaNum(0)
        for (var i = 0; i <= 3; i++) {
        player.am.dimAmt[i] = (getBuyableAmount("am",11+i))
        }
        if (layer != "p") {//重置p层内容
            player.i.ku24 = false
            player.p.points = new ExpantaNum(0)
            setBuyableAmount("p",11,new ExpantaNum(0))
            setBuyableAmount("p",12,new ExpantaNum(0))
            setBuyableAmount("p",13,new ExpantaNum(0))
            setBuyableAmount("p",14,new ExpantaNum(0))
            setBuyableAmount("p",21,new ExpantaNum(0))
            setBuyableAmount("p",22,new ExpantaNum(0))
            setBuyableAmount("p",23,new ExpantaNum(0))
            setBuyableAmount("p",24,new ExpantaNum(0))
            player.p.upgrades = []
        }
    },
    update(diff){
        player.p.time = player.p.time.add(new ExpantaNum(diff).mul(player.p.b11eff));
        player.p.lastAntiPoints = player.p.lastAntiPoints.mul(new ExpantaNum(1.02).pow(new ExpantaNum(diff).mul(player.p.b11eff).div(player.p.b23eff)))
        player.p.antiPoints = player.p.lastAntiPoints.div(player.i.points.add(1))
        if (hasUpgrade("p",11)) player.p.antiPoints = player.p.antiPoints.div(new ExpantaNum(1.5).pow(getBuyableAmount("i",11).add(getBuyableAmount("i",12)).add(getBuyableAmount("i",13))))
    },

    layerShown(){
        if (player.points.gte(0.1) || player.p.points.gt(0) || player.p.ls) {
            player.p.ls = true;
            return true
        } else {
            return false
        }
    },
})
addLayer("am", {
    branches: ["i"],
    name: "Antimatter", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "AM", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        //part1
        unlocked: true,
		points: new ExpantaNum(0),
        amEff: new ExpantaNum(1),
        inPow: new ExpantaNum(0),
        powEff: new ExpantaNum(1),
        dimAmt: [new ExpantaNum(0),new ExpantaNum(0),new ExpantaNum(0),new ExpantaNum(0)],
        dimMul: [new ExpantaNum(1),new ExpantaNum(1),new ExpantaNum(1),new ExpantaNum(1)],
        dimShow: ["","","",""],
        u11eff: new ExpantaNum(0),
    }},
    color: "#db4c83",
    requires: new ExpantaNum(100), 
    resource: "反物质", // Name of prestige currency
    baseResource: "增量可重复购买项数量",
    baseAmount() {return getBuyableAmount("i",11).add(getBuyableAmount("i",12)).add(getBuyableAmount("i",13))}, 
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 3,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new ExpantaNum(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        
        for (var i = 0; i <= 3; i++) {
            if (player.am.dimAmt[i].lt(getBuyableAmount("am",11+i))) {
                player.am.dimAmt[i] = (getBuyableAmount("am",11+i))//维度不小于购买数量
            }
            player.am.dimMul[i] = new ExpantaNum(2).pow(getBuyableAmount("am",11+i)).mul(player.i.points.add(1).pow(0.25))
            //dimShow
            var mul = `${i == 0 ? "维度1" : i == 1 ? "维度2" : i == 2 ? "维度3" : "维度4"}&nbsp&nbsp${format(player.am.dimMul[i])}x&nbsp&nbsp`
            var mulNbsp = ""
            while (mul.length * 5 + mulNbsp.length < 180) {mulNbsp = mulNbsp + "&nbsp"}
            var amt = `${format(player.am.dimAmt[i])}(${format(getBuyableAmount("am",11+i))})&nbsp&nbsp`
            var amtNbsp = ""
            while (amt.length * 5 + amtNbsp.length < 200) {amtNbsp = amtNbsp + "&nbsp"}
            player.am.dimShow[i] = mul + mulNbsp + amt + amtNbsp
       }
        player.am.amEff = player.am.points.mul(2).pow(0.67).add(1)//反物质效果
        player.am.powEff = player.am.inPow.add(1).pow(0.25)//增量力量效果
        //升级效果
        player.am.u11eff = player.i.points.add(10).log10()
        return new ExpantaNum(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)  QwQ:1也可以当第一排
    /*effectDescription() {
        if (player.points.gte(1) || player.i.ds) {
            player.i.ds = true;
            return "将反点数除以 " + format(player.i.points.add(1))
        } else {
            return "你至少拥有1点数才能获得增量"
        }
    },*/
    effectDescription() {
        return "将点数获取*" + format(player.am.amEff)
 
    },
    tabFormat: {
        "维度": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                ["display-text",function() {return "你有" + format(player.am.inPow) + "增量力量,将增量获取*" + format(player.am.powEff)}],
                ["display-text",function() {return "你每秒获得" + format(player.am.dimAmt[0].mul(player.am.dimMul[0])) + "增量力量"}],
                ["row",[["display-text",function() {return player.am.dimShow[0]}],["buyable",11,{"height":"36px"}]]],
                ["row",[["display-text",function() {return player.am.dimShow[1]}],["buyable",12,{"height":"36px"}]]],
		        ["row",[["display-text",function() {return player.am.dimShow[2]}],["buyable",13,{"height":"36px"}]]],
                ["row",[["display-text",function() {return player.am.dimShow[3]}],["buyable",14,{"height":"36px"}]]],
	        	//["display-text", function() {return `你每秒获得${format(player.i.inGain)}增量` },
                //    { "font-size":"22px"}],
	        	//["display-text", function() {return getBuyableAmount("i",11).lt(4) ? '你需要 4 个增量速度以解锁下一个升级' : getBuyableAmount("i",12).lt(4) ? '你需要3个增量强度以解锁下一个升级' : ''}],
	        	"blank",
 
                "blank",
            ],
        },
        "升级": {
            content: [
                "main-display",
                "prestige-button",
                "blank",
                "upgrades",
            ],
        },
    },
    //clickables: {
        //part1
        //11: {
        //    canClick(){return true},
        //    display() {return `Update the game<br />You've updated ${Utimeformat(player.u.updtime)}.<br /><br />Now you are doing:${updtxt[player.u.doing]}`},
        //    onClick(){player.u.doing = "upd"}
        //},
    //},
    buyables: {
        11: {
            display() {
                return `价格: ${format(this.cost())}反物质`
            },
            cost() {return new ExpantaNum(10).pow(getBuyableAmount("am",11))},
            canAfford() { return player.am.points.gte(this.cost()) },
            buy() {
                player.am.points = player.am.points.sub(this.cost())
                setBuyableAmount("am",11,getBuyableAmount("am",11).add(1))
            },
            style() {
                return {"height":"36px","width":"180px"}
            },
        },
        12: {
            display() {
                return `价格: ${format(this.cost())}反物质`
            },
            cost() {return new ExpantaNum(100).pow(getBuyableAmount("am",12).add(1))},
            canAfford() { return player.am.points.gte(this.cost()) },
            buy() {
                player.am.points = player.am.points.sub(this.cost())
                setBuyableAmount("am",12,getBuyableAmount("am",12).add(1))
            },
            style() {
                return {"height":"36px","width":"180px"}
            },
        },
        13: {
            display() {
                return `价格: ${format(this.cost())}反物质`
            },
            cost() {return new ExpantaNum(10).mul(new ExpantaNum(1000).pow(getBuyableAmount("am",13).add(1)))},
            canAfford() { return player.am.points.gte(this.cost()) },
            buy() {
                player.am.points = player.am.points.sub(this.cost())
                setBuyableAmount("am",13,getBuyableAmount("am",13).add(1))
            },
            style() {
                return {"height":"36px","width":"180px"}
            },
        },
        14: {
            display() {
                return `价格: ${format(this.cost())}反物质`
            },
            cost() {return new ExpantaNum(1000000).pow(getBuyableAmount("am",14).add(1))},
            canAfford() { return player.am.points.gte(this.cost()) },
            buy() {
                player.am.points = player.am.points.sub(this.cost())
                setBuyableAmount("am",14,getBuyableAmount("am",14).add(1))
            },
            style() {
                return {"height":"36px","width":"180px"}
            },
        },
    },

    upgrades: {
        11: {
            title: "Plane",
            description() {return "增量数量提升增量获得量<br>当前效果: *" + format(player.am.u11eff) },
            cost(){return new ExpantaNum(2)},
            unlocked(){return true},
        },
        /*12: {
            title: "Cash",
            description() {return "解锁一个可重复购买项，每购买一个这一行的升级，增量获得量乘1.1<br>当前效果: *" + format(upgradeEffect("i",12)) },
            cost(){return new ExpantaNum(30)},
            unlocked(){return hasUpgrade("i",11)},
        },
        13: {
            title: "Raze",
            description() {return "解锁第二个可重复购买项" },
            cost(){return new ExpantaNum(100)},
            unlocked(){return getBuyableAmount("i",11).gte(4)},
        },
        14: {
            title: "Raise",
            description() {return "解锁第三个可重复购买项" },
            cost(){return new ExpantaNum(0)},
            unlocked(){return getBuyableAmount("i",12).gte(3)},
        },*/
    },
    
    /*
    challenges: {
        11: {
            name: "AntiLooperrrr",
            challengeDescription: "因为挑战出了bug，devU13被禁用了。刷新后的第一帧时间计数x100。",
            canComplete(){return player.points.gte(1e10)},
            goalDescription(){return format(ExpantaNum(1e10))+"点数"},
            rewardDisplay(){return `你永远保留dev11的效果，同时“刷新后的第一帧时间计数x100。”被保留。`},
            unlocked(){return hasUpgrade("dev",15)}
        },
    },
    */

    update(diff){
        player.am.inPow = player.am.inPow.add(player.am.dimAmt[0].mul(player.am.dimMul[0]).mul(diff))
        for (var i = 0; i < 3 ; i++) {
            player.am.dimAmt[i] = player.am.dimAmt[i].add(player.am.dimAmt[i+1].mul(player.am.dimMul[i+1]).mul(diff))
        }
    },
    layerShown(){return false},
})