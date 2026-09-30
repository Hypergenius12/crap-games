// THE REALM OF SHADOWS - 1:1 BATCH PORT
// State definitions
const DEFAULT_STATE = {
    lvl: 1, xp: 0, req_xp: 50,
    hp: 100, maxhp: 100,
    gold: 0, diamonds: 0,
    skill_points: 0,
    ascension_level: 0, ascension_souls: 0,
    base_armor: 0, temp_armor: 0,
    base_mindmg: 0, base_maxdmg: 0,
    crit_chance: 5, dodge_chance: 5,
    gold_mult: 100, xp_mult: 100,
    weapon: "Fists", wpn_mindmg: 1, wpn_maxdmg: 5, wpn_plus: 0,
    pet: "None", equipped_relic: "None",
    potion: 0, elixirs: 0, omega_potions: 0,
    bombs: 0, omega_bombs: 0, stuns: 0, venoms: 0, mirrors: 0,
    fish: 0, void_beaten: 0,
    ore_iron: 0, ore_gold: 0, ore_voidium: 0,
    ore_quantum: 0, ore_starmetal: 0, ore_chaos: 0,
    arena_wins: 0, in_arena: 0, last_login: null,
    encounters: {}
};

let state = JSON.parse(JSON.stringify(DEFAULT_STATE));
let currentCombat = null;

const ui = {
    status: document.getElementById('status-bar'),
    console: document.getElementById('output-console'),
    actionGrid: document.getElementById('action-grid'),
    quickTabs: document.getElementById('quick-tabs')
};

// Utilities
function randomRange(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function print(html, className = '') {
    const el = document.createElement('div');
    el.className = `output-line ${className}`;
    el.innerHTML = html;
    ui.console.appendChild(el);
    ui.console.scrollTop = ui.console.scrollHeight;
}
function clearLog() { ui.console.innerHTML = ''; }
function clearActions() { ui.actionGrid.innerHTML = ''; ui.quickTabs.innerHTML = ''; }

function addAction(title, callback, options = {}) {
    const btn = document.createElement('button');
    btn.className = `btn-command ${options.variant ? `variant-${options.variant}` : ''}`;
    let costHtml = options.cost ? `<span class="btn-cost">${options.cost}</span>` : '';
    btn.innerHTML = `<span>${title}</span>${costHtml}`;
    btn.onclick = callback;
    ui.actionGrid.appendChild(btn);
}

function setTabs(tabs) {
    ui.quickTabs.innerHTML = '';
    tabs.forEach(t => {
        const tabBtn = document.createElement('button');
        tabBtn.className = `tab-btn ${t.active ? 'active' : ''}`;
        tabBtn.textContent = t.label;
        tabBtn.onclick = t.action;
        ui.quickTabs.appendChild(tabBtn);
    });
}

function getStats() {
    let petArmor = state.pet === "Golem" ? 15 : 0;
    let totalArmor = state.base_armor + state.temp_armor + petArmor;
    let upgradeDmg = state.wpn_plus * 50;
    let minDmg = state.wpn_mindmg + state.base_mindmg + upgradeDmg;
    let maxDmg = state.wpn_maxdmg + state.base_maxdmg + upgradeDmg;
    return { totalArmor, minDmg, maxDmg };
}

function updateUI() {
    state.gold = Math.min(2000000000, Math.max(0, state.gold));
    state.diamonds = Math.min(2000000000, Math.max(0, state.diamonds));
    state.hp = Math.min(state.maxhp, Math.max(0, state.hp));
    const { totalArmor, minDmg, maxDmg } = getStats();
    
    const hpPct = Math.max(0, Math.min(100, Math.round((state.hp / state.maxhp) * 100)));
    const xpPct = Math.max(0, Math.min(100, Math.round((state.xp / state.req_xp) * 100)));
    const ascBonus = state.ascension_level * 10;
    
    ui.status.innerHTML = `
        <div class="status-row-primary">
            <div class="brand-badge">⚔️ THE REALM OF SHADOWS <span style="color: var(--accent-cyan); font-size: 0.75rem;">v18.0</span></div>
            <div class="stat-pills">
                <div class="stat-pill"><span class="label">LVL</span><span class="val">${state.lvl} [ASC: ${state.ascension_level} - +${ascBonus}%]</span></div>
                <div class="stat-pill gold"><span class="label">GOLD</span><span class="val">${state.gold.toLocaleString()}G</span></div>
                <div class="stat-pill diamond"><span class="label">DIA</span><span class="val">${state.diamonds.toLocaleString()}D</span></div>
                <div class="stat-pill soul"><span class="label">SOULS</span><span class="val">${state.ascension_souls}</span></div>
                <div class="stat-pill sp"><span class="label">SP</span><span class="val">${state.skill_points}</span></div>
            </div>
        </div>
        <div class="status-meters">
            <div class="meter-wrapper">
                <div class="meter-label-row">
                    <span>HEALTH POINT (HP)</span>
                    <span><strong>${state.hp.toLocaleString()}</strong> / ${state.maxhp.toLocaleString()}</span>
                </div>
                <div class="meter-bar"><div class="meter-fill hp" style="width: ${hpPct}%;"></div></div>
            </div>
            <div class="meter-wrapper">
                <div class="meter-label-row">
                    <span>EXPERIENCE (XP)</span>
                    <span><strong>${state.xp.toLocaleString()}</strong> / ${state.req_xp.toLocaleString()}</span>
                </div>
                <div class="meter-bar"><div class="meter-fill xp" style="width: ${xpPct}%;"></div></div>
            </div>
        </div>
        <div class="status-gear-row">
            <div>WPN: <strong>${state.weapon} +${state.wpn_plus}</strong> (${minDmg.toLocaleString()}-${maxDmg.toLocaleString()} DMG)</div>
            <div>ARMOR: <strong>${totalArmor}</strong></div>
            <div>CRIT: <strong>${state.crit_chance}%</strong> DODGE: <strong>${state.dodge_chance}%</strong></div>
            <div>PET: <strong>${state.pet}</strong></div>
            <div>RELIC: <strong>${state.equipped_relic}</strong></div>
            <div>POTS: <strong>${state.potion}</strong> ELX: <strong>${state.elixirs}</strong> BOMB: <strong>${state.bombs}</strong></div>
        </div>
    `;
    localStorage.setItem('REALM_OF_SHADOWS_SAVE', JSON.stringify(state));
}

function loadGame() {
    const raw = localStorage.getItem('REALM_OF_SHADOWS_SAVE');
    if (!raw) { print(`<span class="highlight-crimson">No save file found!</span>`); return false; }
    try {
        let loaded = JSON.parse(raw);
        state = Object.assign({}, DEFAULT_STATE, loaded);
        if(!state.encounters) state.encounters = {};
        print(`<span class="highlight-green">Game Loaded successfully!</span>`);
        setTimeout(checkDaily, 1500);
        return true;
    } catch(e) { return false; }
}

function checkDaily() {
    const today = new Date().toDateString();
    if (state.last_login !== today) {
        state.last_login = today;
        state.gold += 500;
        state.diamonds += 5;
        clearLog();
        print(`<div class="section-header" style="color: var(--accent-gold);">*** DAILY LOGIN BONUS ***</div>`);
        print(`Welcome back, Hero! The realm blesses your return.`);
        print(`<span class="highlight-gold">+ 500 Gold!</span>`);
        print(`<span class="highlight-cyan">+ 5 Diamonds!</span>`);
        updateUI();
        addAction("Continue", returnHub, { variant: "gold" });
    } else {
        returnHub();
    }
}

function returnHub() {
    if (state.lvl >= 100) sceneZenith();
    else if (state.lvl >= 50) sceneAethelgard();
    else if (state.lvl >= 10) sceneEldoria();
    else sceneTown();
}

function sceneStart() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="title-hero" style="color:var(--accent-crimson);">THE REALM OF SHADOWS</div>`);
    print(`<div class="subtitle-hero">v18.0 - THE ABSOLUTE ENDGAME EDITION</div><br>`);
    print(`Welcome, traveler, to a land plagued by monsters.<br>The ancient Dragon of the Peak has awakened, but it is merely a herald for the true darkness in the Void...<br>`);
    
    addAction("Start New Game: Warrior", () => initClass("Warrior", 150, "Broadsword", 10, 25, 2, 50));
    addAction("Start New Game: Rogue", () => initClass("Rogue", 100, "Dagger", 5, 35, 3, 200));
    addAction("Start New Game: Artificer", () => initClass("Artificer", 80, "Artificer Staff", 15, 40, 5, 100));
    addAction("Start New Game: Paladin", () => initClass("Paladin", 130, "Mace", 8, 22, 2, 80));
    addAction("Start New Game: Ranger", () => initClass("Ranger", 110, "Longbow", 15, 30, 3, 100));
    addAction("Start New Game: Necromancer", () => initClass("Necromancer", 90, "Scythe", 12, 38, 1, 50), {variant: "purple"});
    addAction("LOAD SAVED GAME", () => { if (!loadGame()) setTimeout(sceneStart, 1500); }, { variant: "gold" });
}

function initClass(c, hp, wpn, min, max, pot, g) {
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    state.hp = hp; state.maxhp = hp; state.weapon = wpn;
    state.wpn_mindmg = min; state.wpn_maxdmg = max;
    state.potion = pot; state.gold = g;
    if(c==="Artificer"){ state.stuns=3; state.venoms=2; }
    if(c==="Paladin"){ state.base_armor=2; }
    if(c==="Necromancer"){ state.ascension_souls=2; state.pet="Skeleton"; }
    checkDaily();
}

// =================== FACILITIES ===================

function sceneTown() {
    clearLog(); clearActions(); updateUI();
    setTabs([
        { label: "Oakhaven (Current)", active: true, action: sceneTown },
        { label: "Eldoria (Lvl 10+)", active: false, action: () => state.lvl >= 10 ? sceneEldoria() : print("Requires Level 10!", "highlight-crimson") },
        { label: "Aethelgard (Lvl 50+)", active: false, action: () => state.lvl >= 50 ? sceneAethelgard() : print("Requires Level 50!", "highlight-crimson") },
        { label: "Zenith (Lvl 100+)", active: false, action: () => state.lvl >= 100 ? sceneZenith() : print("Requires Level 100!", "highlight-crimson") }
    ]);
    print(`<div class="section-header" style="color:var(--accent-green);">*** OAKHAVEN VILLAGE ***</div>`);
    print(`The rustic, bustling starting town. Guards patrol the wooden gates.<br>`);
    print(`[ FACILITIES ]`);
    addAction("1. Oakhaven Blacksmith", sceneBlacksmith);
    addAction("2. Oakhaven Alchemist", sceneAlchemist);
    addAction("3. Rusty Coin Casino", sceneCasino);
    addAction("4. Oakhaven Tavern (Rest)", () => {
        if(state.gold<15) { print("The innkeeper glares at you. 'No coin, no bed. Out!'", "highlight-crimson"); return; }
        state.gold-=15; state.hp=state.maxhp; updateUI(); print("<span class='highlight-green'>You rested comfortably and restored full HP!</span>");
    }, {cost: "15 Gold"});
    addAction("5. Quiet Fishing Pond", sceneFishing);
    addAction("6. The Beastmaster", scenePets);
    print(`<br>[ ADVENTURE ]`);
    addAction("7. Explore Wilderness", sceneWilderness, {variant: "danger"});
    addAction("8. Endless Blood Arena", sceneArena, {variant: "danger"});
    addAction("9. The Bounty Board", sceneBounties, {variant: "danger"});
    print(`<br>[ TRAVEL & SYSTEM ]`);
    if(state.lvl>=10) addAction("10. Travel to ELDORIA CITY", sceneEldoria, {variant: "gold"});
    addAction("Save Game", () => { updateUI(); print("<span class='highlight-green'>Game Saved successfully!</span>"); });
    addAction("Exit Game", sceneStart);
}

function sceneBlacksmith() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header" style="color:#aaa;">*** OAKHAVEN FORGE ***</div>`);
    print(`The blacksmith wipes soot from his brow.<br><br>[ UPGRADE STATION ]`);
    addAction("Upgrade Current Weapon (+50 DMG)", () => {
        if(state.gold<2000) return print("Not enough gold!", "highlight-crimson");
        state.gold-=2000; state.wpn_plus++; updateUI(); print("<span class='highlight-green'>Weapon Upgraded to +"+state.wpn_plus+"!</span>");
    }, {cost: "2000 Gold", variant: "gold"});
    print(`<br>[ WEAPONS ]`);
    addAction("Buy Steel Sword (DMG: 20-35)", () => buyWpn("Steel Sword",20,35,100,1), {cost:"100 G"});
    addAction("Buy Obsidian Blade (DMG: 40-60)", () => buyWpn("Obsidian Blade",40,60,250,1), {cost:"250 G"});
    addAction("Buy Mithril Axe (DMG: 60-90)", () => buyWpn("Mithril Axe",60,90,500,1), {cost:"500 G"});
    addAction("Buy Dragonbone Gt. (DMG: 100-150)", () => buyWpn("Dragonbone Greatsword",100,150,900,5), {cost:"900 G [Req Lvl 5]"});
    addAction("Buy Void Ripper (DMG: 200-350)", () => buyWpn("Void Ripper",200,350,2500,8), {cost:"2500 G [Req Lvl 8]", variant: "purple"});
    print(`<br>[ ARMOR ]`);
    addAction("Buy Leather Armor (+3 Armor)", () => buyArmor(3,80), {cost:"80 G"});
    addAction("Buy Iron Plate (+8 Armor)", () => buyArmor(8,200), {cost:"200 G"});
    addAction("Buy Mithril Mail (+15 Armor)", () => buyArmor(15,600), {cost:"600 G"});
    addAction("Buy Dragon Scale (+30 Armor)", () => buyArmor(30,1500), {cost:"1500 G"});
    addAction("Buy Void Mantle (+60 Armor)", () => buyArmor(60,4000), {cost:"4000 G", variant: "purple"});
    addAction("Back to Town", returnHub);
}

function buyWpn(n, min, max, cost, rLvl) {
    if(state.lvl<rLvl) return print("You must be Level "+rLvl+" to wield this!", "highlight-crimson");
    if(state.gold<cost) return print("Not enough gold!", "highlight-crimson");
    state.gold-=cost; state.weapon=n; state.wpn_mindmg=min; state.wpn_maxdmg=max; state.wpn_plus=0; updateUI();
    print("<span class='highlight-green'>Purchased "+n+"!</span>");
}
function buyArmor(a, cost) {
    if(state.gold<cost) return print("Not enough gold!", "highlight-crimson");
    state.gold-=cost; state.temp_armor=a; updateUI();
    print("<span class='highlight-green'>Purchased Armor!</span>");
}

function sceneAlchemist() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header" style="color:var(--accent-purple);">*** THE ALCHEMIST ***</div><br>`);
    addAction("Buy 1 Health Potion", () => buyItem("potion", 1, 20), {cost:"20 G"});
    addAction("Buy 3 Health Potions", () => buyItem("potion", 3, 50), {cost:"50 G"});
    addAction("Buy 10 Health Potions", () => buyItem("potion", 10, 150), {cost:"150 G"});
    addAction("Buy 1 Elixir", () => buyItem("elixirs", 1, 150), {cost:"150 G"});
    addAction("Buy 1 OMEGA Potion", () => buyDiaItem("omega_potions", 1, 5), {cost:"5 D", variant:"cyan"});
    print(`<br>[ TACTICAL ITEMS ]`);
    addAction("Buy 1 Stun Bomb", () => buyItem("stuns", 1, 500), {cost:"500 G"});
    addAction("Buy 1 Venom Flask", () => buyItem("venoms", 1, 1000), {cost:"1000 G"});
    addAction("Buy 1 Cursed Mirror", () => buyDiaItem("mirrors", 1, 50), {cost:"50 D", variant:"cyan"});
    print(`<br>[ EXPLOSIVES ]`);
    addAction("Buy 1 Fire Bomb", () => buyItem("bombs", 1, 75), {cost:"75 G"});
    addAction("Buy 1 Void Bomb", () => buyItem("bombs", 1, 300), {cost:"300 G", variant: "purple"});
    addAction("Buy 1 OMEGA Bomb", () => buyDiaItem("omega_bombs", 1, 10), {cost:"10 D", variant: "cyan"});
    print(`<br>[ TRADES ]`);
    addAction("Trade Fish (50 Fish -> 1 Diamond)", () => {
        if(state.fish<50) return print("You don't have enough fish!", "highlight-crimson");
        state.fish-=50; state.diamonds++; updateUI(); print("<span class='highlight-cyan'>You traded 50 Fish for 1 Diamond!</span>");
    });
    addAction("Buy 1 Diamond", () => buyDiamonds(1, 500), {cost:"500 G"});
    addAction("Buy 10 Diamonds", () => buyDiamonds(10, 5000), {cost:"5000 G"});
    addAction("Buy 1,000 Diamonds", () => buyDiamonds(1000, 50000), {cost:"50k G"});
    addAction("MEGA TRADE (100k Diamonds)", () => buyDiamonds(100000, 50000000), {cost:"50M G", variant:"gold"});
    addAction("Back", returnHub);
}

function buyItem(k, q, c) { if(state.gold<c) return print("Not enough gold!","highlight-crimson"); state.gold-=c; state[k]+=q; updateUI(); print("<span class='highlight-green'>Bought!</span>"); }
function buyDiaItem(k, q, c) { if(state.diamonds<c) return print("Not enough Diamonds!","highlight-crimson"); state.diamonds-=c; state[k]+=q; updateUI(); print("<span class='highlight-cyan'>Bought!</span>"); }
function buyDiamonds(q, c) { if(state.gold<c) return print("Not enough gold!","highlight-crimson"); state.gold-=c; state.diamonds+=q; updateUI(); print("<span class='highlight-cyan'>Purchased Diamonds!</span>"); }

function sceneCasino() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header" style="color:var(--accent-gold);">*** RUSTY COIN CASINO ***</div><br>`);
    addAction("'Goblin's Guess' (Win 150 G)", () => casGuess(50, 150), {cost:"50 G"});
    addAction("'High Roller' (Win 1500 G)", () => casGuess(500, 1500), {cost:"500 G", variant: "gold"});
    addAction("'Lucky 7s Dice'", () => {
        if(state.gold<100) return print("Not enough gold!","highlight-crimson");
        state.gold-=100;
        let d1=randomRange(1,6), d2=randomRange(1,6), sum=d1+d2;
        print(`You rolled a ${d1} and a ${d2}. Total: ${sum}`);
        if(sum===7){ print("<span class='highlight-gold'>LUCKY 7! YOU WON 300 GOLD!</span>"); state.gold+=300; }
        else if(sum>7){ print("<span class='highlight-green'>High roll! YOU WON 200 GOLD!</span>"); state.gold+=200; }
        else print("Low roll... House wins.");
        updateUI();
    }, {cost:"100 G"});
    addAction("'Troll Slots'", () => {
        if(state.gold<250) return print("Not enough gold!","highlight-crimson");
        state.gold-=250;
        let s1=randomRange(1,5), s2=randomRange(1,5), s3=randomRange(1,5);
        print(`<br>[ ${s1} ] - [ ${s2} ] - [ ${s3} ]<br>`);
        if(s1===s2 && s2===s3){ print("<span class='highlight-gold'>JACKPOT!!! ALL THREE MATCH! YOU WON 2500 GOLD!!!</span>"); state.gold+=2500; }
        else if(s1===s2 || s2===s3 || s1===s3){ print("<span class='highlight-green'>TWO MATCH! YOU WON 500 GOLD!</span>"); state.gold+=500; }
        else print("No matches... The machine eats your coin.");
        updateUI();
    }, {cost:"250 G"});
    addAction("Back", returnHub);
}
function casGuess(bet, win) {
    if(state.gold<bet) return print("Not enough gold!","highlight-crimson");
    state.gold-=bet; updateUI();
    print(`I'm thinking of a number 1, 2, or 3.`);
    clearActions();
    [1,2,3].forEach(n => {
        addAction(`Guess ${n}`, () => {
            let res = randomRange(1,3);
            if(n===res){ print(`<span class='highlight-gold'>YOU WON ${win} GOLD!</span>`); state.gold+=win; }
            else print(`Wrong! It was ${res}.`);
            updateUI(); setTimeout(sceneCasino, 1500);
        });
    });
}

function sceneFishing() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header" style="color:var(--accent-cyan);">*** QUIET FISHING POND ***</div>`);
    print(`You sit by the tranquil pond on the edge of town.`);
    addAction("1. Cast your line", () => {
        if(state.gold<5) return print("Not enough gold for bait!", "highlight-crimson");
        state.gold-=5; updateUI();
        let catchRoll = randomRange(0, 99);
        if(catchRoll >= 99){ print("<span class='highlight-gold'>YOU REELED IN THE LEGENDARY WHALE FISH!!! Gained 60 Fish!</span>"); state.fish+=60; }
        else if(catchRoll >= 95){ print("<span class='highlight-crimson'>The water churns... A massive POND LURKER attacks!</span>"); return startCombat("The Pond Lurker", 500, 80, 250, 200); }
        else if(catchRoll >= 85){ print("<span class='highlight-gold'>You pulled up a Sunken Treasure Chest! Found 150 Gold!</span>"); state.gold+=150; }
        else if(catchRoll >= 70){ print("You caught an Abyssal Eel!"); state.fish+=4; }
        else if(catchRoll >= 50){ print("<span class='highlight-gold'>You caught a Rare Golden Koi!</span>"); state.fish+=3; }
        else if(catchRoll >= 30){ print("You caught a Silver Salmon!"); state.fish+=2; }
        else if(catchRoll >= 10){ print("You caught a plump Bass!"); state.fish+=1; }
        else if(catchRoll >= 5){ print("You reeled in a bunch of Tangled Kelp. Useless."); }
        else { print("You caught an Old Boot. Gross."); }
        updateUI();
    }, {cost:"5 G"});
    addAction("2. Eat a Fish", () => {
        if(state.fish<1) return print("You don't have any fish!", "highlight-crimson");
        state.fish--; state.hp = Math.min(state.maxhp, state.hp+30); updateUI(); print("<span class='highlight-green'>Recovered 30 HP!</span>");
    });
    addAction("3. Back", returnHub);
}

function scenePets() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header" style="color:var(--accent-green);">*** THE BEASTMASTER ***</div>`);
    addAction("Buy Wolf (10-25 DMG per turn)", () => buyPet("Wolf", 800), {cost:"800 G"});
    addAction("Buy Fairy (Heals 10-20 HP per turn)", () => buyPet("Fairy", 1200), {cost:"1200 G"});
    addAction("Buy Golem (+15 Permanent Armor)", () => buyPet("Golem", 2000), {cost:"2000 G"});
    addAction("Back", returnHub);
}
function buyPet(n, c) { if(state.gold<c) return print("Not enough gold!", "highlight-crimson"); state.gold-=c; state.pet=n; updateUI(); print("<span class='highlight-green'>Acquired "+n+"!</span>"); }

// =================== ELDORIA FACILITIES ===================
function sceneEldoria() {
    clearLog(); clearActions(); updateUI();
    setTabs([
        { label: "Oakhaven", active: false, action: sceneTown },
        { label: "Eldoria (Current)", active: true, action: sceneEldoria },
        { label: "Aethelgard (Lvl 50+)", active: false, action: () => state.lvl >= 50 ? sceneAethelgard() : print("Requires Level 50!", "highlight-crimson") },
        { label: "Zenith (Lvl 100+)", active: false, action: () => state.lvl >= 100 ? sceneZenith() : print("Requires Level 100!", "highlight-crimson") }
    ]);
    print(`<div class="section-header" style="color:var(--accent-gold);">*** ELDORIA CITY ***</div>`);
    print(`The shining capital of the realm. The streets are paved with marble.<br><br>[ FACILITIES ]`);
    addAction("1. The Diamond Forge", sceneDiamondForge);
    addAction("2. The Deep Mines", sceneMines);
    addAction("3. The Relic Forge", sceneRelicForge);
    addAction("4. The Skill Trainer", sceneSkills);
    addAction("5. The Royal Museum", sceneMuseum);
    addAction("6. Shady Black Market", sceneBlackmarket);
    addAction("7. The Nexus of Time", sceneNexus);
    print(`<br>[ ADVENTURE ]`);
    addAction("8. Endgame Regions", sceneEndgameRegions, {variant: "danger"});
    print(`<br>[ TRAVEL ]`);
    if(state.lvl>=50) addAction("9. Travel to AETHELGARD", sceneAethelgard, {variant: "purple"});
    addAction("10. Travel back to Oakhaven", sceneTown);
}

function sceneDiamondForge() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header" style="color:var(--accent-cyan);">*** THE DIAMOND FORGE ***</div>`);
    print(`"Gold means nothing here," the glowing ethereal smith declares.<br><br>[ WEAPONS ]`);
    addAction("Celestial Bow (DMG: 400-600)", () => buyDiaWpn("Celestial Bow",400,600,10,10), {cost:"10 D [Req Lvl 10]"});
    addAction("Astral Blade (DMG: 800-1200)", () => buyDiaWpn("Astral Blade",800,1200,25,15), {cost:"25 D [Req Lvl 15]"});
    addAction("Cosmic Scythe (DMG: 2k-3.5k)", () => buyDiaWpn("Cosmic Scythe",2000,3500,75,25), {cost:"75 D [Req Lvl 25]"});
    addAction("INFINITY EDGE (DMG: 5k-8k)", () => buyDiaWpn("INFINITY EDGE",5000,8000,200,40), {cost:"200 D [Req Lvl 40]", variant: "gold"});
    addAction("QUANTUM REAPER (DMG: 15k-30k)", () => buyDiaWpn("QUANTUM REAPER",15000,30000,1000,75), {cost:"1000 D [Req Lvl 75]", variant: "purple"});
    print(`<br>[ ARMOR ]`);
    addAction("Astral Plate (+150 Armor)", () => buyDiaArmor(150, 30), {cost:"30 D"});
    addAction("Cosmic Aegis (+400 Armor)", () => buyDiaArmor(400, 80), {cost:"80 D"});
    addAction("INFINITY WARD (+1000 Armor)", () => buyDiaArmor(1000, 250), {cost:"250 D", variant: "gold"});
    addAction("QUANTUM SUIT (+5000 Armor)", () => buyDiaArmor(5000, 1200), {cost:"1200 D", variant: "purple"});
    addAction("Back", sceneEldoria);
}
function buyDiaWpn(n, min, max, cost, rLvl){
    if(state.lvl<rLvl) return print("Level too low!","highlight-crimson");
    if(state.diamonds<cost) return print("Not enough Diamonds!","highlight-crimson");
    state.diamonds-=cost; state.weapon=n; state.wpn_mindmg=min; state.wpn_maxdmg=max; state.wpn_plus=0; updateUI(); print("<span class='highlight-cyan'>Purchased "+n+"!</span>");
}
function buyDiaArmor(a, cost){
    if(state.diamonds<cost) return print("Not enough Diamonds!","highlight-crimson");
    state.diamonds-=cost; state.temp_armor=a; updateUI(); print("<span class='highlight-cyan'>Purchased Armor!</span>");
}

function sceneMines() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header" style="color:#aaa;">*** THE DEEP MINES ***</div>`);
    print(`The caverns echo with the sound of pickaxes.<br>[ INVENTORY ]<br>Iron: ${state.ore_iron} | Gold: ${state.ore_gold} | Voidium: ${state.ore_voidium} | Quantum: ${state.ore_quantum} | Star-Metal: ${state.ore_starmetal} | Chaos Core: ${state.ore_chaos}<br>`);
    addAction("1. Swing Pickaxe", () => {
        if(state.gold<50) return print("Not enough gold!", "highlight-crimson");
        state.gold-=50; updateUI();
        let roll = randomRange(0, 99);
        if(roll>=98){ print("<span class='highlight-gold'>Found STAR-METAL!</span>"); state.ore_starmetal++; }
        else if(roll>=95){ print("<span class='highlight-cyan'>Found QUANTUM ORE!</span>"); state.ore_quantum++; }
        else if(roll>=80){ print("<span class='highlight-purple'>Found VOIDIUM ORE!</span>"); state.ore_voidium++; }
        else if(roll>=50){ print("<span class='highlight-gold'>Found GOLD ORE!</span>"); state.ore_gold++; }
        else if(roll>=20){ print("Found IRON ORE!"); state.ore_iron++; }
        else if(roll>=5){ print("Found nothing."); }
        else { print("<span class='highlight-crimson'>A Cave Crawler ambushes you!</span>"); return startCombat("Cave Crawler", 300, 50, 100, 80); }
        updateUI();
    }, {cost:"50 G"});
    addAction("2. Deep Drill", () => {
        if(state.diamonds<10) return print("Not enough Diamonds!", "highlight-crimson");
        state.diamonds-=10; updateUI();
        let roll = randomRange(0, 99);
        if(roll>=95){ print("<span class='highlight-crimson'>Found CHAOS CORE!</span>"); state.ore_chaos++; }
        else if(roll>=70){ print("<span class='highlight-gold'>Found 3 STAR-METAL!</span>"); state.ore_starmetal+=3; }
        else if(roll>=40){ print("<span class='highlight-cyan'>Found 5 QUANTUM ORE!</span>"); state.ore_quantum+=5; }
        else { print("<span class='highlight-purple'>Found 5 Voidium.</span>"); state.ore_voidium+=5; }
        updateUI();
    }, {cost:"10 D", variant:"cyan"});
    addAction("Back", sceneEldoria);
}

function sceneRelicForge() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header" style="color:var(--accent-purple);">*** THE RELIC FORGE ***</div>`);
    print(`Combine your ores here to create Godly passive Relics.<br>Currently Equipped: <strong style="color:var(--accent-cyan);">${state.equipped_relic}</strong><br>`);
    addAction("Relic of Wealth (Doubles Gold Drops)", () => forgeRelic("Wealth", {ore_gold:10}), {cost:"10 Gold Ore"});
    addAction("Relic of Vitality (+2000 Max HP)", () => forgeRelic("Vitality", {ore_iron:5, ore_gold:5}, {hp:2000}), {cost:"5 Iron, 5 Gold"});
    addAction("Relic of the Void (+500 Base DMG)", () => forgeRelic("Void", {ore_voidium:5}, {dmg:500}), {cost:"5 Voidium"});
    addAction("Relic of Quantum (Auto-Dodge 25%)", () => forgeRelic("Quantum", {ore_quantum:3}, {dodge:25}), {cost:"3 Quantum"});
    addAction("Relic of the Star (+5000 Base DMG)", () => forgeRelic("Star", {ore_starmetal:5}, {dmg:5000}), {cost:"5 Star-Metal"});
    addAction("Relic of Chaos (+50000 Max HP)", () => forgeRelic("Chaos", {ore_chaos:3}, {hp:50000}), {cost:"3 Chaos Cores"});
    addAction("Relic of the Reaper (Life Steal on Hit)", () => forgeRelic("Reaper", {ore_voidium:10, ore_chaos:2}), {cost:"10 Voidium, 2 Chaos", variant:"purple"});
    addAction("Back", sceneEldoria);
}
function forgeRelic(n, cost, stats={}) {
    for(let k in cost) if(state[k]<cost[k]) return print("Missing Ores!", "highlight-crimson");
    for(let k in cost) state[k]-=cost[k];
    state.equipped_relic = n;
    if(stats.hp) { state.maxhp+=stats.hp; state.hp=state.maxhp; }
    if(stats.dmg) { state.base_mindmg+=stats.dmg; state.base_maxdmg+=stats.dmg; }
    if(stats.dodge) { state.dodge_chance = Math.min(75, state.dodge_chance+stats.dodge); }
    updateUI(); print("<span class='highlight-green'>Forged and Equipped Relic of "+n+"!</span>");
}

function sceneSkills() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header" style="color:var(--accent-green);">*** THE SKILL TRAINER ***</div>`);
    print(`"Spend your Skill Points (SP) to hone your body and mind."<br>Available SP: ${state.skill_points}<br>`);
    addAction("Sharpened Senses (+1% Crit Chance)", () => {
        if(state.skill_points<1) return print("Not enough SP!","highlight-crimson");
        if(state.crit_chance>=50) return print("Maxed!","highlight-crimson");
        state.skill_points--; state.crit_chance++; updateUI(); print("<span class='highlight-green'>Crit Chance increased!</span>");
    }, {cost:"1 SP"});
    addAction("Swift Reflexes (+1% Dodge Chance)", () => {
        if(state.skill_points<1) return print("Not enough SP!","highlight-crimson");
        if(state.dodge_chance>=50) return print("Maxed!","highlight-crimson");
        state.skill_points--; state.dodge_chance++; updateUI(); print("<span class='highlight-green'>Dodge Chance increased!</span>");
    }, {cost:"1 SP"});
    addAction("Iron Fortitude (+50 Max HP)", () => {
        if(state.skill_points<1) return print("Not enough SP!","highlight-crimson");
        state.skill_points--; state.maxhp+=50; state.hp=state.maxhp; updateUI(); print("<span class='highlight-green'>Max HP increased!</span>");
    }, {cost:"1 SP"});
    addAction("Lethality (+25 Base DMG)", () => {
        if(state.skill_points<1) return print("Not enough SP!","highlight-crimson");
        state.skill_points--; state.base_mindmg+=25; state.base_maxdmg+=25; updateUI(); print("<span class='highlight-green'>Base Damage increased!</span>");
    }, {cost:"1 SP"});
    addAction("Wealth Gen (+5% Gold Drop)", () => {
        if(state.skill_points<1) return print("Not enough SP!","highlight-crimson");
        state.skill_points--; state.gold_mult+=5; updateUI(); print("<span class='highlight-green'>Gold Multiplier increased!</span>");
    }, {cost:"1 SP"});
    addAction("Rapid Learner (+5% XP Gain)", () => {
        if(state.skill_points<1) return print("Not enough SP!","highlight-crimson");
        state.skill_points--; state.xp_mult+=5; updateUI(); print("<span class='highlight-green'>XP Multiplier increased!</span>");
    }, {cost:"1 SP"});
    addAction("Back", sceneEldoria);
}

function sceneMuseum() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header">*** THE ROYAL MUSEUM ***</div>`);
    print(`A grand hall filled with statues of beasts you have slain.<br>`);
    
    let e = Object.keys(state.encounters);
    print(`Discovered: ${e.length} / 47`);
    
    const allEnemies = [
        "Goblin Scavenger", "Dire Wolf", "Forest Bandit", "Cursed Ent", "Venomous Spider", "Shadow Stalker", "Toxic Slime", "Lizardman Warrior", "Swamp Hag", "Mud Golem", "Plague Bringer", "Will-o-Wisp", "Animated Armor", "Skeletal Knight", "Wraith", "Gargoyle", "Phantom Assassin", "Cave Troll", "Harpy Matriarch", "Stone Golem", "Frost Wyrm", "Rock Crusher", "Treasure Goblin", "Golden Mimic", "The Pond Lurker", "Ancient Dragon", "Crystal Leviathan", "The Void Lord", "Seraphim of Judgement", "THE OMEGA ENTITY", "Quantum Stalker", "Quantum Phantom", "THE QUANTUM OVERLORD", "Celestial Dragon", "Void Behemoth", "Weaver of Timelines", "Ashen Titan", "Sunken Behemoth", "Astral Sentinel", "Avatar of Chaos", "THE ADMINISTRATOR", "Rift Spawn", "Abyssal Dreadnought", "Dimension Weaver", "THE RIFT DEVOURER", "Seraphic Guard", "Reality Warden", "THE CREATOR"
    ];
    let html = "<div style='column-count: 2;'>";
    allEnemies.forEach(name => {
        if(state.encounters[name]) html += `<div style="color:var(--accent-green);">- ${name}</div>`;
        else html += `<div style="color:#555;">- ??????</div>`;
    });
    html += "</div>";
    print(html);
    addAction("Back", sceneEldoria);
}

function sceneBlackmarket() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header" style="color:var(--accent-purple);">*** SHADY BLACK MARKET ***</div>`);
    print(`"I sell permanent power. No refunds."<br>`);
    addAction("Titan's Blood (+50 Max HP)", () => {
        if(state.gold<500) return print("Not enough gold. Scram!","highlight-crimson");
        state.gold-=500; state.maxhp+=50; state.hp=state.maxhp; updateUI(); print("<span class='highlight-green'>Max HP increased by 50!</span>");
    }, {cost:"500 G"});
    addAction("Assassin's Mark (+1% Crit)", () => {
        if(state.gold<800) return print("Not enough gold. Scram!","highlight-crimson");
        state.gold-=800; state.crit_chance++; updateUI(); print("<span class='highlight-green'>Permanent Crit Chance increased by 1!</span>");
    }, {cost:"800 G"});
    addAction("Whetstone of Ruin (+10 Base DMG)", () => {
        if(state.gold<800) return print("Not enough gold. Scram!","highlight-crimson");
        state.gold-=800; state.base_mindmg+=10; state.base_maxdmg+=10; updateUI(); print("<span class='highlight-green'>Permanent Base Damage increased by 10!</span>");
    }, {cost:"800 G"});
    addAction("God's Blessing (+100k HP, +50k DMG)", () => {
        if(state.gold<30000000) return print("You don't have 30 Million Gold. Stop wasting my time!","highlight-crimson");
        state.gold-=30000000; state.maxhp+=100000; state.hp=state.maxhp; state.base_mindmg+=50000; state.base_maxdmg+=50000; updateUI(); print("<span class='highlight-gold'>YOU HAVE RECEIVED GOD'S BLESSING!</span>");
    }, {cost:"30,000,000 G", variant:"gold"});
    addAction("Back", sceneEldoria);
}

function sceneNexus() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header">*** THE NEXUS OF TIME ***</div>`);
    print(`The air here hums with infinite possibilities.<br>A being of pure light offers to exchange your Ascension Souls for godhood.<br>[ SOULS AVAILABLE: ${state.ascension_souls} ]<br>`);
    addAction("Infuse Soul (+1000 Max HP)", () => {
        if(state.ascension_souls<1) return print("You lack the souls.", "highlight-crimson");
        state.ascension_souls--; state.maxhp+=1000; state.hp=state.maxhp; updateUI(); print("<span class='highlight-green'>Max HP permanently increased by 1000!</span>");
    }, {cost:"1 Soul", variant:"cyan"});
    addAction("Infuse Soul (+500 Base DMG)", () => {
        if(state.ascension_souls<1) return print("You lack the souls.", "highlight-crimson");
        state.ascension_souls--; state.base_mindmg+=500; state.base_maxdmg+=500; updateUI(); print("<span class='highlight-green'>Base Damage permanently increased by 500!</span>");
    }, {cost:"1 Soul", variant:"cyan"});
    addAction("Infuse Soul (+10,000 Gold)", () => {
        if(state.ascension_souls<1) return print("You lack the souls.", "highlight-crimson");
        state.ascension_souls--; state.gold+=10000; updateUI(); print("<span class='highlight-gold'>You instantly gained 10,000 Gold!</span>");
    }, {cost:"1 Soul", variant:"gold"});
    addAction("ASCEND", () => {
        clearActions();
        print("<span class='highlight-crimson'>ARE YOU SURE? Ascending will reset your Level, Gold, Weapons, Armor, and Items. You WILL KEEP your Ascension Level, Souls, Pets, SP, Diamonds, Ores, Relics, and Permanent Stat Buffs.</span>");
        addAction("YES, ASCEND", () => {
            state.lvl = 1; state.xp = 0; state.req_xp = 50; state.gold = 0;
            state.weapon = "Fists of a God"; state.wpn_mindmg = 1; state.wpn_maxdmg = 5; state.wpn_plus = 0;
            state.temp_armor = 0; state.base_armor = 0;
            state.potion = 0; state.elixirs = 0; state.bombs = 0; state.omega_potions = 0; state.omega_bombs = 0;
            state.stuns = 0; state.venoms = 0; state.mirrors = 0; state.fish = 0; state.void_beaten = 0;
            state.hp = state.maxhp;
            state.ascension_level++;
            clearLog();
            print(`<div class="section-header" style="color:var(--accent-cyan);">=====================================================<br>YOU HAVE ASCENDED BEYOND MORTAL LIMITS.<br>=====================================================</div>`);
            updateUI();
            addAction("Continue", checkDaily);
        }, {variant: "danger"});
        addAction("Cancel", sceneNexus);
    }, {variant: "purple"});
    addAction("Back", sceneEldoria);
}

// =================== AETHELGARD (Lvl 50+) ===================
function sceneAethelgard() {
    clearLog(); clearActions(); updateUI();
    setTabs([
        { label: "Oakhaven", active: false, action: sceneTown },
        { label: "Eldoria", active: false, action: sceneEldoria },
        { label: "Aethelgard (Current)", active: true, action: sceneAethelgard },
        { label: "Zenith (Lvl 100+)", active: false, action: () => state.lvl >= 100 ? sceneZenith() : print("Requires Level 100!", "highlight-crimson") }
    ]);
    print(`<div class="section-header" style="color:var(--accent-purple);">*** AETHELGARD, CITY OF SKIES ***</div>`);
    print(`Suspended in the clouds, this city is home to mythical warriors.<br><br>[ FACILITIES ]`);
    addAction("1. The Mythic Forge", sceneMythicForge);
    addAction("2. The Soul Enchanter", sceneSoulEnchanter);
    addAction("3. The Nexus of Time", sceneNexus);
    print(`<br>[ ADVENTURE ]`);
    addAction("4. Mythic Regions", sceneMythicRegions, {variant: "danger"});
    print(`<br>[ TRAVEL ]`);
    if(state.lvl>=100) addAction("5. Ascend to ZENITH", sceneZenith, {variant: "gold"});
    addAction("6. Travel back to Eldoria", sceneEldoria);
}

function sceneMythicForge() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header" style="color:var(--accent-purple);">*** THE MYTHIC FORGE ***</div>`);
    print(`"Mortal concepts of currency fade here. I require Diamonds and Stars."<br><br>[ WEAPONS ]`);
    addAction("Soul Render (DMG: 40k-60k)", () => buyDiaWpn("Soul Render", 40000, 60000, 2500, 80), {cost:"2500 D [Req Lvl 80]"});
    addAction("Starbreaker (DMG: 100k-150k)", () => buyDiaWpn("Starbreaker", 100000, 150000, 5000, 90), {cost:"5000 D [Req Lvl 90]", variant:"gold"});
    print(`<br>[ ARMOR ]`);
    addAction("Soulweave Plate (+12,000 Armor)", () => buyDiaArmor(12000, 3000), {cost:"3000 D"});
    addAction("Starforged Aegis (+30,000 Armor)", () => buyDiaArmor(30000, 6000), {cost:"6000 D", variant:"gold"});
    addAction("Back", sceneAethelgard);
}

function sceneSoulEnchanter() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header" style="color:var(--accent-purple);">*** THE SOUL ENCHANTER ***</div>`);
    print(`"I weave diamonds into the fabric of your soul."<br>`);
    addAction("Diamond Veins (+5000 Max HP)", () => {
        if(state.diamonds<1000) return print("Need Diamonds.", "highlight-crimson");
        state.diamonds-=1000; state.maxhp+=5000; state.hp=state.maxhp; updateUI(); print("<span class='highlight-green'>Max HP increased by 5000!</span>");
    }, {cost:"1000 D", variant:"cyan"});
    addAction("Ghost Step (+1% Dodge Chance)", () => {
        if(state.diamonds<1000) return print("Need Diamonds.", "highlight-crimson");
        state.diamonds-=1000; state.dodge_chance++; updateUI(); print("<span class='highlight-green'>Permanent Dodge Chance increased by 1!</span>");
    }, {cost:"1000 D", variant:"cyan"});
    addAction("Fists of Chaos (+1000 Base DMG)", () => {
        if(state.diamonds<2000) return print("Need Diamonds.", "highlight-crimson");
        state.diamonds-=2000; state.base_mindmg+=1000; state.base_maxdmg+=1000; updateUI(); print("<span class='highlight-green'>Permanent Base Damage increased by 1000!</span>");
    }, {cost:"2000 D", variant:"cyan"});
    addAction("Back", sceneAethelgard);
}

// =================== ZENITH (Lvl 100+) ===================
function sceneZenith() {
    clearLog(); clearActions(); updateUI();
    setTabs([
        { label: "Oakhaven", active: false, action: sceneTown },
        { label: "Eldoria", active: false, action: sceneEldoria },
        { label: "Aethelgard", active: false, action: sceneAethelgard },
        { label: "Zenith (Current)", active: true, action: sceneZenith }
    ]);
    print(`<div class="section-header" style="color:#fff;">*** ZENITH, CITY OF GODS ***</div>`);
    print(`Pure light radiates from every surface. You have reached the pinnacle.<br><br>[ FACILITIES ]`);
    addAction("1. The God Forge", sceneGodForge, {variant:"gold"});
    print(`<br>[ ADVENTURE ]`);
    addAction("2. The Omniverse Portal", sceneOmniverse, {variant:"danger"});
    addAction("3. The Abyssal Rift", () => {
        if(state.lvl<500) return print("Requires Level 500!", "highlight-crimson");
        let roll = randomRange(0, 9);
        if(roll<4) startCombat("Rift Spawn", 50000, 15000, 800000, 750000);
        else if(roll<8) startCombat("Abyssal Dreadnought", 150000, 40000, 2000000, 1500000);
        else startCombat("Dimension Weaver", 80000, 100000, 3000000, 2500000);
    }, {variant:"danger"});
    addAction("4. Throne of the Creator", () => {
        if(state.lvl<1000) return print("Requires Level 1000!", "highlight-crimson");
        let roll = randomRange(0, 9);
        if(roll<5) startCombat("Seraphic Guard", 5000000, 500000, 50000000, 40000000);
        else if(roll<9) startCombat("Reality Warden", 10000000, 1000000, 150000000, 100000000);
        else { print("<span class='highlight-gold'>THE HEAVENS PART. YOU HAVE AWAKENED THE SOURCE.</span>"); startCombat("THE CREATOR", 100000000, 5000000, 1000000000, 1000000000); }
    }, {variant:"danger"});
    print(`<br>[ TRAVEL ]`);
    addAction("5. Return to Aethelgard", sceneAethelgard);
}

function sceneGodForge() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header" style="color:#fff;">*** THE GOD FORGE ***</div>`);
    print(`"Only those who transcend reality may wield these instruments."<br><br>[ WEAPONS ]`);
    addAction("Reality's End (DMG: 300k-500k)", () => buyDiaWpn("Reality's End", 300000, 500000, 15000, 120), {cost:"15,000 D [Req Lvl 120]"});
    addAction("The Administrator (DMG: 1M-2.5M)", () => buyDiaWpn("Administrator Blade", 1000000, 2500000, 50000, 150), {cost:"50,000 D [Req Lvl 150]", variant:"gold"});
    print(`<br>[ ARMOR ]`);
    addAction("Reality Mantle (+100k Armor)", () => buyDiaArmor(100000, 20000), {cost:"20,000 D"});
    addAction("Administrator Code (+500k Armor)", () => buyDiaArmor(500000, 75000), {cost:"75,000 D", variant:"gold"});
    addAction("Back", sceneZenith);
}

// =================== ADVENTURE REGIONS ===================
function sceneWilderness() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header">*** THE WILDERNESS ***</div>`);
    addAction("The Dark Forest [Lvl 1+]", () => {
        let r = randomRange(0, 11);
        if(r===0) return eventMerchant();
        if(r===1) return eventGold();
        if(r===2 || r===8 || r===9 || r===10 || r===11) startCombat("Goblin Scavenger", 40, 15, 25, 15);
        else if(r===3) startCombat("Dire Wolf", 60, 20, 35, 20);
        else if(r===4) startCombat("Forest Bandit", 80, 25, 45, 25);
        else if(r===5) startCombat("Cursed Ent", 120, 30, 60, 35);
        else if(r===6) startCombat("Venomous Spider", 50, 35, 40, 30);
        else if(r===7) startCombat("Shadow Stalker", 70, 45, 80, 45);
        // Treasure goblin missing in random range from original, wait, original says:
        // 0=merchant, 1=gold, 2=spawn1, 3=spawn2, 4=spawn3, 5=spawn4, 6=spawn5, 7=spawn6, 8=spawn7, default=spawn1.
    });
    // Fixing forest exactly:
    ui.actionGrid.lastChild.onclick = () => {
        let r = randomRange(0, 11);
        if(r===0) eventMerchant();
        else if(r===1) eventGold();
        else if(r===2) startCombat("Goblin Scavenger", 40, 15, 25, 15);
        else if(r===3) startCombat("Dire Wolf", 60, 20, 35, 20);
        else if(r===4) startCombat("Forest Bandit", 80, 25, 45, 25);
        else if(r===5) startCombat("Cursed Ent", 120, 30, 60, 35);
        else if(r===6) startCombat("Venomous Spider", 50, 35, 40, 30);
        else if(r===7) startCombat("Shadow Stalker", 70, 45, 80, 45);
        else if(r===8) startCombat("Treasure Goblin", 200, 5, 2500, 50);
        else startCombat("Goblin Scavenger", 40, 15, 25, 15);
    };

    addAction("Whispering Swamps [Lvl 3+]", () => {
        let r = randomRange(0, 9);
        if(r===0) eventShrine();
        else if(r===1) startCombat("Toxic Slime", 100, 35, 50, 40);
        else if(r===2) startCombat("Lizardman Warrior", 130, 45, 75, 50);
        else if(r===3) startCombat("Swamp Hag", 90, 60, 80, 60);
        else if(r===4) startCombat("Mud Golem", 200, 30, 90, 70);
        else if(r===5) startCombat("Plague Bringer", 110, 75, 100, 85);
        else startCombat("Will-o-Wisp", 60, 100, 120, 90);
    });

    addAction("Abandoned Keep [Lvl 5+]", () => {
        let r = randomRange(0, 9);
        if(r===0) eventBeggar();
        else if(r===1) startCombat("Animated Armor", 200, 50, 100, 80);
        else if(r===2) startCombat("Skeletal Knight", 180, 65, 120, 90);
        else if(r===3) startCombat("Wraith", 150, 80, 150, 110);
        else if(r===4) startCombat("Gargoyle", 300, 70, 200, 140);
        else if(r===5) startCombat("Golden Mimic", 500, 200, 5000, 300);
        else startCombat("Phantom Assassin", 120, 150, 250, 160);
    });

    addAction("Dread Mountains [Lvl 7+]", () => {
        let r = randomRange(0, 9);
        if(r<3) startCombat("Cave Troll", 300, 85, 200, 150);
        else if(r<6) startCombat("Harpy Matriarch", 220, 100, 220, 160);
        else if(r<8) startCombat("Stone Golem", 450, 70, 250, 200);
        else if(r<9) startCombat("Frost Wyrm", 500, 150, 400, 300);
        else startCombat("Rock Crusher", 800, 60, 300, 250);
    });

    addAction("DRAGON'S VOLCANO [BOSS - Lvl 10+]", () => {
        print("LAIR OF THE ANCIENT DRAGON", "highlight-crimson");
        setTimeout(() => startCombat("Ancient Dragon", 1500, 250, 2500, 2000), 1000);
    }, {variant:"danger"});

    addAction("Back", sceneTown);
}

function sceneEndgameRegions() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header" style="color:var(--accent-purple);">*** THE ENDGAME ***</div>`);
    addAction("Crystal Caverns [Lvl 15+]", () => startCombat("Crystal Leviathan", 2500, 400, 1500, 1200));
    addAction("THE VOID REALM [TRUE BOSS - Lvl 20+]", () => {
        if(randomRange(0,9)>=8) { print("A MASSIVE SHADOW DETACHES FROM THE VOID!"); return setTimeout(()=>startCombat("Void Behemoth", 12000, 1000, 40000, 35000), 1000); }
        print("THE VOID REALM", "highlight-purple"); setTimeout(() => startCombat("The Void Lord", 6000, 600, 15000, 15000), 1000);
    }, {variant:"danger"});
    addAction("Celestial Spire [ENDGAME]", () => {
        if(!state.void_beaten) return print("Defeat The Void Lord first!", "highlight-crimson");
        if(randomRange(0,9)>=8) { print("A DRAGON OF PURE LIGHT DESCENDS!"); return setTimeout(()=>startCombat("Celestial Dragon", 25000, 2000, 150000, 250000), 1000); }
        print("THE CELESTIAL SPIRE", "highlight-cyan"); setTimeout(()=>startCombat("Seraphim of Judgement", 15000, 1200, 75000, 100000), 1000);
    });
    addAction("The Edge of Infinity [OMEGA BOSS - Lvl 50+]", () => {
        if(state.lvl<50) return print("Requires Level 50!", "highlight-crimson");
        if(randomRange(0,9)>=8) { print("TIME ITSELF FRACTURES BEFORE YOU!"); return setTimeout(()=>startCombat("Weaver of Timelines", 80000, 5000, 1000000, 1200000), 1000); }
        print("THE EDGE OF INFINITY", "highlight-gold"); setTimeout(()=>startCombat("THE OMEGA ENTITY", 50000, 3000, 500000, 500000), 1000);
    }, {variant:"danger"});
    addAction("The Quantum Realm [ABSOLUTE BOSS - Lvl 75+]", () => {
        if(state.lvl<75) return print("Requires Level 75!", "highlight-crimson");
        let r = randomRange(0, 2);
        if(r===0) startCombat("Quantum Stalker", 30000, 5000, 200000, 300000);
        else if(r===1) startCombat("Quantum Phantom", 25000, 6000, 250000, 350000);
        else { print("THE FABRIC OF REALITY SHATTERS!"); setTimeout(()=>startCombat("THE QUANTUM OVERLORD", 150000, 10000, 2000000, 2000000), 1000); }
    }, {variant:"danger"});
    addAction("Back", sceneEldoria);
}

function sceneMythicRegions() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header" style="color:var(--accent-purple);">*** MYTHIC REGIONS ***</div>`);
    addAction("The Ashen Wastes [Lvl 80+]", () => {
        if(state.lvl<80) return print("Requires Lvl 80!","highlight-crimson"); print("THE ASHEN WASTES"); setTimeout(()=>startCombat("Ashen Titan", 300000, 20000, 5000000, 5000000), 1000);
    });
    addAction("The Sunken City [Lvl 90+]", () => {
        if(state.lvl<90) return print("Requires Lvl 90!","highlight-crimson"); print("THE SUNKEN CITY"); setTimeout(()=>startCombat("Sunken Behemoth", 800000, 40000, 15000000, 15000000), 1000);
    });
    addAction("The Astral Plane [Lvl 100+]", () => {
        if(state.lvl<100) return print("Requires Lvl 100!","highlight-crimson"); print("THE ASTRAL PLANE"); setTimeout(()=>startCombat("Astral Sentinel", 2000000, 100000, 50000000, 50000000), 1000);
    });
    addAction("Back", sceneAethelgard);
}

function sceneOmniverse() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header" style="color:var(--accent-purple);">*** THE OMNIVERSE PORTAL ***</div>`);
    addAction("The Chaos Dimension [Lvl 120+]", () => {
        if(state.lvl<120) return print("Requires Lvl 120!","highlight-crimson"); print("THE CHAOS DIMENSION"); setTimeout(()=>startCombat("Avatar of Chaos", 10000000, 500000, 200000000, 200000000), 1000);
    });
    addAction("The Admin's Server [GOD BOSS - Lvl 150+]", () => {
        if(state.lvl<150) return print("Requires Lvl 150!","highlight-crimson"); print("// ACCESSING ROOT SERVER //"); setTimeout(()=>startCombat("THE ADMINISTRATOR", 50000000, 2000000, 1000000000, 1000000000), 1000);
    }, {variant:"danger"});
    addAction("Back", sceneZenith);
}

function sceneArena() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header" style="color:var(--accent-crimson);">*** THE ENDLESS ARENA ***</div>`);
    print(`"Welcome to the pit!" the Arena Master shouts.<br>Current Wave: ${state.arena_wins}`);
    addAction("Enter the Arena", () => {
        state.in_arena = 1;
        let w = state.arena_wins;
        let aw_sq = w * w;
        let base_hp_scale = aw_sq * 100 + w * 500;
        let hp = base_hp_scale + 100;
        let base_dmg_scale = aw_sq * 25 + w * 100;
        let dmg = base_dmg_scale + 20;
        let drop = (aw_sq * 100 + w * 500) + 50;
        let xp = (aw_sq * 150 + w * 500) + 50;
        startCombat("Arena Gladiator", hp, dmg, drop, xp);
    }, {variant:"danger"});
    addAction("Back", returnHub);
}

function arenaPostWin() {
    state.arena_wins++;
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header" style="color:var(--accent-green);">WAVE CLEARED! You are now on Wave ${state.arena_wins}.</div>`);
    if(randomRange(0,9)>7) { state.diamonds++; print("<span class='highlight-cyan'>THE CROWD CHEERS! A Diamond was thrown into the pit!</span>"); updateUI(); }
    addAction("Continue to Next Wave", () => {
        let w = state.arena_wins;
        let aw_sq = w * w;
        let base_hp_scale = aw_sq * 100 + w * 500;
        let hp = base_hp_scale + 100;
        let base_dmg_scale = aw_sq * 25 + w * 100;
        let dmg = base_dmg_scale + 20;
        let drop = (aw_sq * 100 + w * 500) + 50;
        let xp = (aw_sq * 150 + w * 500) + 50;
        startCombat("Arena Gladiator", hp, dmg, drop, xp);
    }, {variant:"danger"});
    addAction("Flee the Arena", () => { state.in_arena = 0; returnHub(); });
}

function sceneBounties() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header">*** THE BOUNTY BOARD ***</div>`);
    addAction("Hunt: The Blood-Soaked Orc", () => startCombat("Blood-Soaked Orc", 400, 60, 500, 400), {variant:"danger"});
    addAction("Hunt: The Night Terror", () => startCombat("The Night Terror", 1500, 200, 2500, 1500), {variant:"danger"});
    addAction("Hunt: The Corrupted Paladin", () => startCombat("Corrupted Paladin", 8000, 600, 10000, 8000), {variant:"danger"});
    addAction("Back", sceneTown);
}

// EVENTS
function eventGold() {
    clearLog(); clearActions(); updateUI();
    let found = randomRange(10, 50);
    state.gold += found;
    print(`You find a hidden chest in the underbrush!<br><span class='highlight-gold'>You looted ${found} gold!</span>`);
    updateUI(); addAction("Continue", returnHub);
}
function eventMerchant() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header" style="color:var(--accent-purple);">*** WANDERING MERCHANT ***</div>`);
    print(`A mysterious merchant appears from the fog.<br>"I have things you won't find in town... for a price."`);
    addAction("Buy Mystic Elixir (Full HP, +50 Max HP)", () => {
        if(state.gold<1000) { print("'You waste my time.' The merchant vanishes.", "highlight-crimson"); clearActions(); return addAction("Leave", returnHub); }
        state.gold-=1000; state.maxhp+=50; state.hp=state.maxhp; updateUI();
        print("<span class='highlight-green'>You drank the Mystic Elixir! You feel incredible power!</span>"); clearActions(); addAction("Leave", returnHub);
    }, {cost:"1000 G", variant:"purple"});
    addAction("Decline and leave", returnHub);
}
function eventShrine() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header" style="color:var(--accent-gold);">*** FORGOTTEN SHRINE ***</div>`);
    print(`You discover an ancient, glowing shrine hidden in the muck.`);
    addAction("Pray at the Shrine", () => {
        clearActions();
        if(randomRange(0,1)===1){
            print("<span class='highlight-green'>The gods bless you! Base damage increased by 5!</span>");
            state.base_mindmg+=5; state.base_maxdmg+=5; updateUI(); addAction("Continue", returnHub);
        } else {
            print("<span class='highlight-crimson'>The shrine was cursed! You are struck by dark magic. You lost 30 HP!</span>");
            state.hp-=30; updateUI();
            if(state.hp<=0) return combatLose();
            addAction("Continue", returnHub);
        }
    });
    addAction("Ignore it", returnHub);
}
function eventBeggar() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="section-header" style="color:#aaa;">*** THE STARVING BEGGAR ***</div>`);
    print(`An old man in rags begs for coin. "Please... just 50 gold to survive."`);
    addAction("Give 50 Gold", () => {
        clearActions();
        if(state.gold<50){ print("You don't have enough gold. You walk away ashamed."); return addAction("Leave", returnHub); }
        state.gold-=50; state.base_armor+=10; updateUI();
        print("You gave the beggar 50 gold.<br>Suddenly, his rags transform into glowing robes!<br><span class='highlight-gold'>'Your kindness is rewarded, champion.'</span><br><span class='highlight-green'>Permanent Armor increased by 10!</span>");
        addAction("Continue", returnHub);
    }, {cost:"50 G"});
    addAction("Walk away", returnHub);
}

// =================== COMBAT SYSTEM ===================

function startCombat(name, hp, dmgMax, drop, xp) {
    currentCombat = { name, maxHp: hp, hp, dmgMax, drop, xp, stunned: 0, poisonDmg: 0 };
    state.encounters[name] = 1;
    clearLog();
    print(`<div class="combat-enemy-banner"><div class="section-header">A wild ${name} appears!</div></div>`);
    renderCombat();
}

function renderCombat() {
    clearActions();
    updateUI();
    let c = currentCombat;
    let html = `<br><div style="border: 1px solid var(--accent-crimson); padding: 10px; text-align: center;">`;
    html += `<div style="color:var(--accent-crimson); font-size: 1.2rem; font-weight: 700;">ENEMY: ${c.name}</div>`;
    html += `<div>HP: <strong>${c.hp.toLocaleString()}</strong></div>`;
    if(c.poisonDmg>0) html += `<div style="color:var(--accent-green);">Poisoned (${c.poisonDmg} DMG/turn)</div>`;
    html += `</div>`;
    print(html);

    addAction(`Attack with ${state.weapon} +${state.wpn_plus}`, combatAttack, {hotkey:"1", variant:"danger"});
    addAction("Use Items", combatItems, {hotkey:"2"});
    addAction("Flee (50%)", () => {
        if(state.in_arena) return print("<span class='highlight-crimson'>YOU CANNOT FLEE THE ARENA!</span>");
        if(randomRange(0,1)===1){ print("You ran away!"); setTimeout(returnHub, 1000); }
        else { print("<span class='highlight-crimson'>Blocked!</span>"); setTimeout(enemyTurn, 1000); }
    }, {hotkey:"3"});
}

function combatItems() {
    clearActions();
    print(`<br>[ POTIONS & RESTORATIVES ]`);
    addAction(`HP Potion [x${state.potion}]`, () => useItem("potion", () => { state.hp = Math.min(state.maxhp, state.hp+50); print("Used HP Potion!"); }));
    addAction(`Elixir [x${state.elixirs}]`, () => useItem("elixirs", () => { state.hp = state.maxhp; print("Used Elixir! Full HP!"); }));
    addAction(`OMEGA Potion [x${state.omega_potions}]`, () => useItem("omega_potions", () => { state.hp = Math.min(state.maxhp, state.hp+2000); print("Used OMEGA Potion!"); }));
    
    print(`<br>[ EXPLOSIVES & TACTICAL ]`);
    addAction(`Fire Bomb [x${state.bombs}]`, () => useItem("bombs", () => { currentCombat.hp -= 150; print("Threw Fire Bomb!"); }, true));
    addAction(`OMEGA Bomb [x${state.omega_bombs}]`, () => useItem("omega_bombs", () => { currentCombat.hp -= 5000; print("Threw OMEGA Bomb!"); }, true));
    addAction(`Stun Bomb [x${state.stuns}]`, () => useItem("stuns", () => { currentCombat.stunned = 1; print("You threw a Stun Bomb! The enemy is blinded and deafened!"); }));
    addAction(`Venom Flask [x${state.venoms}]`, () => useItem("venoms", () => { currentCombat.poisonDmg = Math.max(50, Math.floor(currentCombat.hp/10)); print("You threw a Venom Flask! The enemy is poisoned!"); }));
    addAction(`Cursed Mirror [x${state.mirrors}]`, () => useItem("mirrors", () => { currentCombat.hp = Math.floor(currentCombat.hp/2); print("Used Cursed Mirror! Enemy HP halved!"); }, true));
    addAction("Back", renderCombat);
}

function useItem(key, effect, dmgItem = false) {
    if(state[key]<1) return print("None left!", "highlight-crimson");
    state[key]--;
    effect();
    updateUI();
    clearActions();
    if(dmgItem) setTimeout(checkWin, 1000);
    else setTimeout(enemyTurn, 1000);
}

function combatAttack() {
    clearActions();
    let {minDmg, maxDmg} = getStats();
    let dmg = randomRange(minDmg, maxDmg);
    if (randomRange(0, 99) < state.crit_chance) { dmg *= 2; print("<span class='highlight-gold'>CRITICAL HIT!</span>"); }
    
    currentCombat.hp -= dmg;
    print(`<span class="highlight-green">You deal ${dmg.toLocaleString()} damage!</span>`);
    
    if (state.equipped_relic === "Reaper") {
        let heal = Math.max(1, Math.floor(dmg / 10));
        state.hp = Math.min(state.maxhp, state.hp + heal);
        print(`<span class="highlight-cyan">[RELIC] You healed for ${heal.toLocaleString()} HP!</span>`);
    }
    
    updateUI();
    setTimeout(checkWin, 800);
}

function checkWin() {
    if (currentCombat.hp <= 0) combatWin();
    else enemyTurn();
}

function enemyTurn() {
    let c = currentCombat;
    if(c.poisonDmg > 0) {
        c.hp -= c.poisonDmg;
        print(`<span class='highlight-green'>Poison wracks the enemy for ${c.poisonDmg.toLocaleString()} damage!</span>`);
        updateUI();
        if(c.hp <= 0) return setTimeout(combatWin, 800);
    }
    
    if(c.stunned) {
        c.stunned = 0;
        print(`<span class='highlight-cyan'>The ${c.name} is STUNNED and skips their turn!</span>`);
        return setTimeout(petTurn, 800);
    }
    
    if(randomRange(0, 99) < state.dodge_chance) {
        print(`<span class='highlight-cyan'>You DODGED the enemy attack!</span>`);
        return setTimeout(petTurn, 800);
    }
    
    let raw = randomRange(1, c.dmgMax);
    let {totalArmor} = getStats();
    let finalDmg = Math.max(1, raw - totalArmor);
    
    state.hp -= finalDmg;
    print(`<span class='highlight-crimson'>Enemy hits for ${finalDmg.toLocaleString()} damage!</span>`);
    updateUI();
    
    if(state.hp <= 0) setTimeout(combatLose, 800);
    else setTimeout(petTurn, 800);
}

function petTurn() {
    if(state.pet === "None" || state.pet === "Golem") return renderCombat();
    
    if(state.pet === "Wolf") {
        let dmg = randomRange(10, 25);
        currentCombat.hp -= dmg;
        print(`Wolf bites for ${dmg}!`);
        updateUI();
        if(currentCombat.hp <= 0) return setTimeout(combatWin, 800);
    } else if(state.pet === "Fairy") {
        let heal = randomRange(10, 20);
        state.hp = Math.min(state.maxhp, state.hp + heal);
        print(`<span class='highlight-green'>Fairy heals ${heal}!</span>`);
        updateUI();
    }
    setTimeout(renderCombat, 800);
}

function combatWin() {
    clearActions();
    let c = currentCombat;
    print(`<span class='highlight-green'>You defeated ${c.name}!</span>`);
    
    if(state.equipped_relic === "Wealth") { c.drop *= 2; print("Relic of Wealth activated! Gold drop doubled!"); }
    
    let ascB = state.ascension_level * 10;
    let goldDrop = Math.floor((c.drop * (state.gold_mult + ascB)) / 100);
    let xpDrop = Math.floor((c.xp * (state.xp_mult + ascB)) / 100);
    
    print(`Found ${goldDrop.toLocaleString()} Gold and ${xpDrop.toLocaleString()} XP.`);
    
    if(c.name==="The Void Lord") state.void_beaten=1;
    if(c.name==="Seraphim of Judgement"){ state.ascension_souls+=1; print("<span class='highlight-cyan'>GAINED 1 ASCENSION SOUL!</span>"); }
    if(c.name==="THE OMEGA ENTITY"){ state.ascension_souls+=5; print("<span class='highlight-cyan'>GAINED 5 ASCENSION SOULS!</span>"); }
    if(c.name==="THE QUANTUM OVERLORD"){ state.ascension_souls+=10; state.diamonds+=1000; print("<span class='highlight-cyan'>GAINED 10 ASCENSION SOULS AND 1000 DIAMONDS!</span>"); }
    if(c.name==="THE ADMINISTRATOR"){ state.ascension_souls+=50; state.diamonds+=10000; print("<span class='highlight-cyan'>GAINED 50 ASCENSION SOULS AND 10000 DIAMONDS!</span>"); }
    if(c.name==="THE RIFT DEVOURER"){ state.ascension_souls+=100; state.diamonds+=50000; print("<span class='highlight-cyan'>GAINED 100 ASCENSION SOULS AND 50,000 DIAMONDS!</span>"); }
    if(c.name==="THE CREATOR"){ state.ascension_souls+=500; state.diamonds+=250000; print("<span class='highlight-gold'>GAINED 500 ASCENSION SOULS AND 250,000 DIAMONDS! YOU ARE BEYOND A GOD!</span>"); }
    
    state.gold += goldDrop;
    state.xp += xpDrop;
    let gained = 0;
    
    while(state.xp >= state.req_xp && gained < 500) {
        state.xp -= state.req_xp;
        state.lvl++;
        state.req_xp = (state.lvl * state.lvl * 15) + 50;
        state.maxhp += 30;
        state.hp = state.maxhp;
        state.base_mindmg += 5;
        state.base_maxdmg += 8;
        state.skill_points++;
        gained++;
    }
    
    if(state.xp >= state.req_xp) print("[SYSTEM] Maximum levels gained per battle reached. Remaining XP saved!");
    if(gained > 0) print(`<span class='highlight-gold'>LEVEL UP! You gained ${gained} Levels!<br>You are now Level ${state.lvl}!<br>You received ${gained} SP! Health fully restored! Max HP and Base Damage increased!</span>`);
    
    updateUI();
    
    if(state.in_arena) addAction("Continue", arenaPostWin, {variant:"gold"});
    else addAction("Continue", returnHub, {variant:"gold"});
}

function combatLose() {
    clearLog(); clearActions(); updateUI();
    print(`<div class="title-hero" style="color:var(--accent-crimson);">YOU DIED!</div><br>The realm falls to darkness.`);
    addAction("Restart", sceneStart);
}

// Kickstart
if(!loadGame()) sceneStart();
