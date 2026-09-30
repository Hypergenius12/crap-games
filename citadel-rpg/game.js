// ============================================================================
// THE BLACKWOOD CITADEL - GRAND CARTOGRAPHIC RPG ENGINE
// Version 20.0 - Sprawling 95-Chamber Citadel, 20 Arcane Secrets & True Ascension
// ============================================================================

// --- WEB AUDIO ATMOSPHERIC SYNTHESIZER ---
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSound(type) {
    if (!soundEnabled) return;
    try {
        initAudio();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;

        if (type === 'footstep') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(90, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'door') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.linearRampToValueAtTime(80, now + 0.25);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.25);
        } else if (type === 'secret') {
            // Ethereal ascending arpeggio with shimmer
            const notes = [440, 554.37, 659.25, 880, 1108.73];
            notes.forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                gain.gain.setValueAtTime(0, now + idx * 0.08);
                gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.65);
            });
        } else if (type === 'item') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(783.99, now); // G5
            osc.frequency.setValueAtTime(1046.50, now + 0.08); // C6
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.35);
        } else if (type === 'error') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(110, now);
            osc.frequency.setValueAtTime(95, now + 0.08);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.22);
        } else if (type === 'fanfare') {
            // Grand Royal Victory Fanfare
            const chords = [
                [293.66, 369.99, 440],       // D Major
                [329.63, 415.30, 493.88],    // E Major
                [369.99, 440.00, 554.37],    // F# Minor
                [440.00, 554.37, 659.25, 880]// A Major Full
            ];
            chords.forEach((chord, step) => {
                chord.forEach(freq => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sawtooth';
                    const startTime = now + step * 0.45;
                    const duration = step === 3 ? 2.2 : 0.4;
                    osc.frequency.setValueAtTime(freq, startTime);
                    gain.gain.setValueAtTime(0.08, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(startTime);
                    osc.stop(startTime + duration);
                });
            });
        }
    } catch (e) {
        console.warn("Audio error:", e);
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('sound-btn');
    const icon = document.getElementById('sound-icon');
    const label = document.getElementById('sound-label');
    if (soundEnabled) {
        icon.innerText = '🔊';
        label.innerText = 'Audio ON';
        showToast("Atmospheric sound enabled");
        playSound('item');
    } else {
        icon.innerText = '🔇';
        label.innerText = 'Audio Muted';
        showToast("Audio muted");
    }
}

// --- SECRETS CATALOG (20 DISTINCT ARCANE SECRETS) ---
const secretsCatalog = {
    "secret_bell_vault": { id: "secret_bell_vault", name: "The Bell Wall Mechanism", desc: "Revealed the hidden vault in the Main Hall using the Silver Bell." },
    "secret_sword_light": { id: "secret_sword_light", name: "The Blade of Starlight", desc: "Claimed the radiant Sword of Light from the Hidden Vault pedestal." },
    "secret_crooked_book": { id: "secret_crooked_book", name: "The Tome of Hidden Arches", desc: "Triggered the secret revolving bookshelf in the Grand Library." },
    "secret_golden_chalice": { id: "secret_golden_chalice", name: "The Sovereign's Chalice", desc: "Recovered the sacred Golden Chalice from the Secret Archive." },
    "secret_floorboards": { id: "secret_floorboards", name: "The Lord's Loose Floorboards", desc: "Pried open the bedroom floorboards to unearth the Crown Jewel." },
    "secret_colored_books": { id: "secret_colored_books", name: "The Scholar's Triad", desc: "Placed the Red, Blue, and Golden Books upon the Deep Archives pedestal." },
    "secret_cursed_relic": { id: "secret_cursed_relic", name: "The Abyssal Nether Relic", desc: "Communed with the dark power inside the Forbidden Vault." },
    "secret_kings_sarcophagus": { id: "secret_kings_sarcophagus", name: "The First King's Crown", desc: "Heaved open the sarcophagus in the Tomb of Kings." },
    "secret_telescope_serpent": { id: "secret_telescope_serpent", name: "The Serpent's Constellation", desc: "Calibrated the Great Telescope to coordinates 4-2-9 to unlock the Astrolabe." },
    "secret_anvil_resonance": { id: "secret_anvil_resonance", name: "The Blacksmith's Resonance", desc: "Struck the ancient forge anvil three times to drop the Masterwork Key." },
    "secret_weeping_maiden": { id: "secret_weeping_maiden", name: "Tear of the Weeping Maiden", desc: "Offered an ancient coin to the courtyard fountain to receive the Starlight Pearl." },
    "secret_clockwork_cog": { id: "secret_clockwork_cog", name: "The Chronomancer's Cog", desc: "Arrested the clocktower pendulum gear precisely at the twelfth strike." },
    "secret_harpsichord": { id: "secret_harpsichord", name: "The Harpsichord of Shadows", desc: "Played the B-A-C-H melody to reveal the Royal Dressing Chamber." },
    "secret_iron_maiden_chute": { id: "secret_iron_maiden_chute", name: "The Executioner's Escape Chute", desc: "Triggered the skull latch in the iron maiden leading to the Cistern." },
    "secret_cistern_sluice": { id: "secret_cistern_sluice", name: "The Drained Abyssal Cistern", desc: "Calibrated the three hydraulic pressure valves to unearth the Sunken Void Pearl." },
    "secret_ancestor_mirror": { id: "secret_ancestor_mirror", name: "The Spectral Mirror of Kings", desc: "Cleaned the ancestral mirror with fine silk to reveal the runic cipher." },
    "secret_golem_awakening": { id: "secret_golem_awakening", name: "Awakening the Iron Colossus", desc: "Ignited the dormant ancient golem to smash into the Hidden Crystal Geode." },
    "secret_magnum_opus": { id: "secret_magnum_opus", name: "The Alchemical Magnum Opus", desc: "Transmuted the Elixir of Immortality in the Arcane Crucible." },
    "secret_sphinx_true_name": { id: "secret_sphinx_true_name", name: "The Sphinx's Sacred Name", desc: "Answered the Sphinx's deepest riddle to win the Sphinx's Eye Opal." },
    "secret_true_ascension": { id: "secret_true_ascension", name: "The Sovereign's Grand Regalia", desc: "Consecrated all four royal plinths with the Crown, Sword, Chalice, and Diamond." }
};

// --- ITEM LORE & PROPERTIES DATABASE ---
const itemsDB = {
    "Rusty Key": { desc: "A heavy iron key covered in red rust. The jagged teeth match the iron padlocks of the Central Cell Block.", type: "Key" },
    "Brass Key": { desc: "A slender, polished brass key stamped with the crest of a falcon. Unlocks the Master Bedroom.", type: "Key" },
    "Tomb Key": { desc: "A heavy, cold stone key carved with the screaming visage of an ancient monarch.", type: "Key" },
    "Masterwork Key": { desc: "A magnificent skeleton key forged from folded Damascus steel. Unlocks ancient fortress vaults.", type: "Key" },
    "Warden's Keyring": { desc: "A cluster of brass and iron keys found on the desk of the dungeon warden.", type: "Key" },
    
    "Torch": { desc: "A brand wrapped in pitch-soaked linen. It casts a warm, reassuring glow over pitch-black dungeon vaults.", type: "Tool" },
    "Rope": { desc: "A fifty-foot coil of sturdy hemp rope treated with pine pitch. Essential for descending vertical chasms and oubliettes.", type: "Tool" },
    "Crowbar": { desc: "A solid forged-iron prybar. Perfect for prying open sealed crates, jammed doors, or loose floorboards.", type: "Tool" },
    "Heavy Cleaver": { desc: "A massive butcher's cleaver from the kitchen. Its heavy edge can chop bone or be used as an impact tool.", type: "Tool" },
    "Silk Handkerchief": { desc: "A delicate square of imported royal silk. Soft enough to wipe away centuries of soot without scratching ancient glass.", type: "Item" },

    "Enchanted Goblet": { desc: "A silver chalice that hums with icy resonance. The air above its rim condenses into magical vapor.", type: "Arcane Reagent" },
    "Nightshade Extract": { desc: "A vial of viscous, luminescent purple poison extracted from the greenhouse's primeval flora.", type: "Alchemical Reagent" },
    "Healing Potion": { desc: "A glass flask of simmering ruby liquid. Smells of cinnamon and radiates revitalizing vigor.", type: "Alchemical Reagent" },
    "Starfire Core": { desc: "A pulsing golden sphere containing the captured energy of a fallen star.", type: "Arcane Core" },
    "Elixir of Immortality (Secret)": { desc: "A swirling golden potion brewed in the crucible. Drinking it grants eternal spiritual transcendence.", type: "Legendary Elixir" },

    "Lord's Journal": { desc: "Leather-bound journal. The final ink entry reads: 'The Chapel was consecrated in the year 1472. Only this founding number shall open its sanctuary.'", type: "Lore Book" },
    "Guard's Note": { desc: "A tattered parchment: 'I locked the Western Armory. The passcode is the exact count of ceremonial armor suits standing watch in the Upper Gallery.'", type: "Lore Note" },
    "Astronomer's Log": { desc: "An astrological folio: 'Align the brass lenses with the constellation of the Serpent at coordinates 4-2-9 to unlock the hidden compartment.'", type: "Lore Book" },
    "Founding Scroll": { desc: "Ancient proclamation: 'Hear ye! The Citadel was erected by King Malakor Blackwood in the age of dragonfire.'", type: "Lore Scroll" },
    "Lord's Sheet Music": { desc: "Harpsichord parchment marked with the solemn motif: B - A - C - H.", type: "Lore Scroll" },
    "Warden's Log": { desc: "The ledger of inmates: 'Thirteen cells in the main ring. Thirteen condemned souls.'", type: "Lore Note" },
    "Ancient Coin": { desc: "A thick electrum coin stamped with the face of the Weeping Maiden.", type: "Treasure" },

    "Blue Book": { desc: "A heavy tome entitled 'Tides of the Pale Moon'.", type: "Lore Book" },
    "Red Book": { desc: "A leather-bound grimoire entitled 'Flames of the Crimson Sun'.", type: "Lore Book" },
    "Golden Book": { desc: "A gilded codex entitled 'Dawn of the Sovereign Empire'.", type: "Lore Book" },

    // The 4 Royal Regalia (Required for True Ascension)
    "Sword of Light (Secret)": { desc: "A blade forged from pure solidified starlight. It sheds blinding white light that banishes all darkness and fear.", type: "Royal Regalia" },
    "King's Crown (Secret)": { desc: "The ancient gold and obsidian crown of the First Monarch of Blackwood.", type: "Royal Regalia" },
    "Golden Chalice": { desc: "The sacred royal chalice used during the sovereign coronations of old.", type: "Royal Regalia" },
    "Crown Jewel (Secret)": { desc: "The legendary Blackwood Diamond. Flawless, fist-sized, and radiating ethereal refractions.", type: "Royal Regalia" },

    // Special Secret Relics
    "Cursed Relic": { desc: "A shard of pulsating obsidian from the Nether Void. Whispers of forbidden dominion echo in your mind.", type: "Arcane Secret" },
    "Silver Bell": { desc: "A delicate silver chime that makes no sound. Its base is geometric, designed to fit into a masonry slot.", type: "Arcane Key" },
    "Celestial Astrolabe": { desc: "A brass astronomical sphere showing the celestial movements of the Void.", type: "Secret Relic" },
    "Starlight Pearl": { desc: "A luminous tear-shaped jewel formed from the consecrated waters of the Weeping Maiden.", type: "Secret Relic" },
    "Chronomancer's Cog": { desc: "A brass cog from the clocktower that gently slows time in its immediate vicinity.", type: "Secret Relic" },
    "Abyssal Void Pearl": { desc: "A black pearl plucked from the deep cistern bed. Swirls with endless gravity.", type: "Secret Relic" },
    "Sphinx's Eye Opal": { desc: "A fire opal bestowed by the Sphinx upon hearing the true name of the Citadel's creator.", type: "Secret Relic" },
    "Iron Ring": { desc: "A ring etched with protective binding runes, recovered from the ancient crypts.", type: "Relic" }
};

// ============================================================================
// THE WORLD OF BLACKWOOD CITADEL - 95 CHAMBERS ACROSS 5 ELEVATIONS
// ============================================================================
const world = {
    // ------------------------------------------------------------------------
    // ELEVATION Z: 0 — CITADEL GROUNDS, COURTYARD & INNER KEEP (35 Rooms)
    // ------------------------------------------------------------------------
    "gatehouse": {
        x: 6, y: 14, z: 0, w: 4, h: 4, name: "The Outer Gatehouse", icon: "gate",
        desc: "Massive iron portcullises hang frozen in their rusted stone tracks. Across the dry moat lies the desolate mountain valley, shrouded in perpetual grey mist.",
        items: [], exits: { n: "courtyard", e: "stables", w: "forge" },
        interactions: [
            { label: "Inspect the portcullis winch", action: () => updateText("The heavy iron chains are fused with decades of rust. The fortress is sealed from the outside world.") }
        ]
    },
    "stables": {
        x: 10, y: 14, z: 0, w: 4, h: 4, name: "Citadel Stables", icon: "tree",
        desc: "Rotted wooden stalls stand empty beneath cobwebbed rafters. Dust motes dance in the faint light filtering through arrow slits.",
        items: ["Rope"], exits: { w: "gatehouse" },
        interactions: [
            { label: "Search the tack room", action: () => updateText("Amid rotted leather harnesses and saddles, you find a sturdy fifty-foot coil of hemp rope.") }
        ]
    },
    "forge": {
        x: 2, y: 14, z: 0, w: 4, h: 4, name: "Blacksmith's Forge", icon: "fire",
        desc: "A giant stone hearth sits cold. Cold ash fills the bellows, and an immense masterwork steel anvil sits anchored to an ironwood stump.",
        items: [], exits: { e: "gatehouse" },
        interactions: [
            { label: "Strike the anvil with heavy tool", action: () => {
                if (player.inventory.includes("Heavy Cleaver") || player.inventory.includes("Crowbar")) {
                    puzzleState.anvilHits = (puzzleState.anvilHits || 0) + 1;
                    playSound('door');
                    if (puzzleState.anvilHits >= 3 && !puzzleState.anvilOpened) {
                        puzzleState.anvilOpened = true;
                        discoverSecret("secret_anvil_resonance", "Masterwork Key", "CLANG! On the third rhythmic strike, a hidden compartment slides out from beneath the anvil base, dropping the legendary Masterwork Key!");
                    } else if (!puzzleState.anvilOpened) {
                        updateText(`CLANG! The anvil rings with a deep harmonic hum (${puzzleState.anvilHits}/3 strikes).`);
                    } else {
                        updateText("The anvil sounds a hollow, dull ring. The secret compartment is already emptied.");
                    }
                } else {
                    playSound('error');
                    updateText("You strike the anvil with your bare hands, but it only hurts your knuckles. You need a heavy iron tool or cleaver.");
                }
            }}
        ]
    },
    "courtyard": {
        x: 6, y: 8, z: 0, w: 8, h: 6, name: "The Grand Courtyard", icon: "fountain",
        desc: "A wide cobblestone plaza surrounded by towering battlements. Dead ivy crawls up ancient granite facades. In the center stands the Fountain of the Weeping Maiden.",
        items: [], exits: { s: "gatehouse", n: "main_hall", w: "west_cloister", e: "east_cloister", nw: "garden_entrance", ne: "cemetery" },
        interactions: [
            { label: "Inspect the Weeping Maiden fountain", action: () => {
                let msg = "A lifelike marble sculpture of a weeping queen holding a shallow stone basin. A faint inscription reads: 'Give what was lost, receive what was promised.'";
                if (player.inventory.includes("Ancient Coin") && !puzzleState.maidenBlessed) {
                    world["courtyard"].interactions.push({
                        label: "Toss the Ancient Coin into the basin",
                        action: () => {
                            puzzleState.maidenBlessed = true;
                            removeItemFromPlayer("Ancient Coin");
                            discoverSecret("secret_weeping_maiden", "Starlight Pearl", "The coin vanishes in ripples of golden light. From the maiden's marble eyes wells a single crystal tear that falls into your palm: the Starlight Pearl!");
                        }
                    });
                }
                updateText(msg);
            }}
        ]
    },
    "main_hall": {
        x: 8, y: 4, z: 0, w: 6, h: 4, name: "Main Hall", icon: "door",
        desc: "The monumental entrance hall of the inner citadel. Towering stone columns support rib-vaulted arches. Immense crimson tapestries hang along the walls.",
        items: [], exits: { s: "courtyard", n: "foyer", w: "dining_room", e: "library" },
        interactions: [
            { label: "Inspect the west wall tapestry", action: () => {
                let msg = "You draw aside the dust-laden velvet tapestry. Carved into the granite wall is an indentation shaped precisely like a small hand bell.";
                if (player.inventory.includes("Silver Bell") && !puzzleState.bellPlaced) {
                    world["main_hall"].interactions.push({
                        label: "Place the Silver Bell into the wall slot",
                        action: () => {
                            puzzleState.bellPlaced = true;
                            world["main_hall"].exits.nw = "hidden_armory";
                            removeItemFromPlayer("Silver Bell");
                            discoverSecret("secret_bell_vault", null, "You press the Silver Bell into the masonry. The stone rumbles and slides aside, revealing the legendary Hidden Vault!");
                        }
                    });
                    msg += " You notice your Silver Bell appears to match this exact geometry!";
                }
                updateText(msg);
            }}
        ]
    },
    "hidden_armory": {
        x: 5, y: 2, z: 0, w: 3, h: 4, name: "The Hidden Vault", icon: "chest",
        desc: "A secret sanctuary sealed away since the Citadel's inception. Crystal lanterns still glow with eternal white light. In the center rests a carved white pedestal.",
        items: [], exits: { se: "main_hall" },
        interactions: [
            { label: "Claim the Sword of Light from the pedestal", action: () => {
                if (!puzzleState.swordTaken) {
                    puzzleState.swordTaken = true;
                    discoverSecret("secret_sword_light", "Sword of Light (Secret)", "You draw the legendary Sword of Light from the pedestal! Pure incandescent brilliance fills the chamber, banishing all shadow!");
                } else {
                    updateText("The pedestal stands bare, glowing with residual starlight.");
                }
            }}
        ]
    },
    "foyer": {
        x: 8, y: 0, z: 0, w: 6, h: 4, name: "South Foyer", icon: "door",
        desc: "A grand vestibule connecting the lower keep to the upper noble halls and the dark subterranean vaults. A wide granite staircase ascends to the Upper Gallery.",
        items: [], exits: { s: "main_hall", u: "upper_hall", d: "dungeon_entrance", w: "guard_hallway" },
        interactions: [
            { label: "Search the collapsed masonry", action: () => {
                if (!puzzleState.foyerKeyFound) {
                    puzzleState.foyerKeyFound = true;
                    takeItem("Rusty Key");
                    updateText("Digging through the fallen stones, your fingers close around a heavy iron Rusty Key.");
                } else {
                    updateText("Only shattered mortar and crumbled stone remain.");
                }
            }}
        ]
    },
    "guard_hallway": {
        x: 4, y: 0, z: 0, w: 4, h: 4, name: "Guard Hallway", icon: "door",
        desc: "A wide, reinforced corridor connecting the citadel's defensive barracks and armory. Weapon racks stand stripped bare.",
        items: [], exits: { e: "foyer", w: "western_armory", n: "barracks", s: "mess_hall" },
        interactions: []
    },
    "barracks": {
        x: 4, y: -4, z: 0, w: 4, h: 4, name: "Guard Barracks", icon: "bed",
        desc: "Rows of rotted wooden bunks and broken weapon chests. The smell of old iron and leather lingers in the still air.",
        items: [], exits: { s: "guard_hallway" },
        interactions: [
            { label: "Pry open the sergeant's chest", action: () => {
                if (!puzzleState.barracksNoteFound) {
                    puzzleState.barracksNoteFound = true;
                    takeItem("Guard's Note");
                    updateText("Inside the locked footlocker you discover a crumpled Guard's Note.");
                } else {
                    updateText("The footlocker contains only scraps of mildewed cloth.");
                }
            }}
        ]
    },
    "mess_hall": {
        x: 4, y: 4, z: 0, w: 4, h: 4, name: "Mess Hall", icon: "table",
        desc: "Overturned oak trestle tables and shattered pewter flagons. Slumped in the high seat at the end of the hall is the armored skeleton of the Guard Captain.",
        items: [], exits: { n: "guard_hallway", s: "kitchen" },
        interactions: [
            { label: "Examine the Guard Captain's remains", action: () => {
                if (!puzzleState.tombKeyFound) {
                    puzzleState.tombKeyFound = true;
                    takeItem("Tomb Key");
                    updateText("Clenched in the captain's gauntlets is a chilling stone Tomb Key carved with the visage of an ancient skull.");
                } else {
                    updateText("The captain rests in eternal silence.");
                }
            }}
        ]
    },
    "western_armory": {
        x: 0, y: 0, z: 0, w: 4, h: 4, name: "Western Armory", icon: "swords",
        desc: "The citadel's primary weapons vault. Reinforced iron doors and racks for halberds, shields, and siege tools line the walls.",
        items: ["Crowbar"], locked: true, passcode: "8", exits: { e: "guard_hallway" },
        interactions: [
            { label: "Inspect the armor racks", action: () => updateText("A heavy iron Crowbar rests on the equipment bench.") }
        ]
    },
    "chapel": {
        x: 14, y: 0, z: 0, w: 6, h: 6, name: "The Royal Chapel", icon: "altar",
        desc: "A cathedral of vaulted ribs and stained glass depicting celestial saints. Moonlight streams across rows of rotting pews toward the marble high altar.",
        items: [], locked: true, passcode: "1472", exits: { s: "east_cloister", n: "vestry" },
        interactions: [
            { label: "Search beneath the altar cloth", action: () => {
                if (!puzzleState.silverBellFound) {
                    puzzleState.silverBellFound = true;
                    takeItem("Silver Bell");
                    updateText("Beneath the embroidered altar vestment you find a delicate Silver Bell with a strange geometric base.");
                } else {
                    updateText("The altar table is bare white marble.");
                }
            }}
        ]
    },
    "vestry": {
        x: 14, y: -4, z: 0, w: 6, h: 4, name: "Priest's Vestry", icon: "book",
        desc: "The private preparation chamber for the high clergy. Books of litany and holy vessels rest on cedar shelving.",
        items: ["Lord's Sheet Music"], exits: { s: "chapel" },
        interactions: [
            { label: "Examine the sacred manuscript shelf", action: () => updateText("You discover a yellowed parchment titled 'Lord's Sheet Music' featuring a solemn chorale.") }
        ]
    },
    "garden_entrance": {
        x: 4, y: 8, z: 0, w: 4, h: 4, name: "Garden Gates", icon: "tree",
        desc: "An ornate wrought-iron archway overrun by thorny briars. Stone steps lead into the sprawling Royal Gardens and the Glass Greenhouse to the west.",
        items: [], exits: { se: "courtyard", w: "greenhouse", n: "arboretum", e: "hedge_1" },
        interactions: []
    },
    "greenhouse": {
        x: 0, y: 8, z: 0, w: 4, h: 4, name: "Glass Greenhouse", icon: "tree",
        desc: "A soaring dome of iron and leaded glass panes. Ancient exotic flora has mutated into colossal creeping vines with hypnotic purple nightshade blooms.",
        items: [], exits: { e: "garden_entrance" },
        interactions: [
            { label: "Collect luminescent purple sap", action: () => {
                if (!puzzleState.sapCollected) {
                    puzzleState.sapCollected = true;
                    takeItem("Nightshade Extract");
                    updateText("You gingerly harvest a vial of glowing, deadly Nightshade Extract from the petals.");
                } else {
                    updateText("The remaining blooms have withered.");
                }
            }}
        ]
    },
    "arboretum": {
        x: 4, y: 12, z: 0, w: 4, h: 4, name: "Overgrown Arboretum", icon: "tree",
        desc: "A courtyard of weeping willow boughs and moss-draped marble busts. The gentle whisper of wind through leaves echoes like distant voices.",
        items: [], exits: { s: "garden_entrance", n: "hedge_1" },
        interactions: []
    },
    "hedge_1": {
        x: 0, y: 12, z: 0, w: 4, h: 4, name: "Hedge Maze - Entrance", icon: "tree",
        desc: "Twelve-foot-tall walls of manicured yew hedges form an intricate labyrinth. The path splits into winding corridors shrouded in fog.",
        items: [], exits: { s: "garden_entrance", e: "hedge_2", w: "hedge_trap" },
        interactions: []
    },
    "hedge_trap": {
        x: -4, y: 12, z: 0, w: 4, h: 4, name: "Hedge Maze - Tangled Loop", icon: "tree",
        desc: "Dense foliage presses in from all directions. The rustling wind seems to shift the hedges when your back is turned.",
        items: [], exits: { e: "hedge_1", s: "hedge_trap" },
        interactions: [
            { label: "Search the dead end", action: () => updateText("You find scratches on the stone pavers where trapped travelers once marked their futile wanderings.") }
        ]
    },
    "hedge_2": {
        x: 0, y: 16, z: 0, w: 4, h: 4, name: "Hedge Maze - Fork of the Sundial", icon: "tree",
        desc: "A circular clearing in the hedges. An ancient bronze sundial is mounted upon a fluted marble column.",
        items: [], exits: { w: "hedge_1", n: "hedge_3" },
        interactions: [
            { label: "Examine the sundial", action: () => updateText("The gnomon casts a shadow across the dial: 'Look unto the Serpent in the heavens when the dial strikes midnight.'") }
        ]
    },
    "hedge_3": {
        x: 0, y: 20, z: 0, w: 4, h: 4, name: "Hedge Maze - The Sanctuary", icon: "altar",
        desc: "The peaceful center of the labyrinth. A clear stone pedestal sits surrounded by tranquil white lilies.",
        items: [], exits: { s: "hedge_2" },
        interactions: [
            { label: "Examine the stone pedestal", action: () => {
                if (!puzzleState.astronomerLogFound) {
                    puzzleState.astronomerLogFound = true;
                    takeItem("Astronomer's Log");
                    updateText("Resting upon the pedestal is a leather-bound folio: the Astronomer's Log.");
                } else {
                    updateText("The pedestal is empty among the blooming lilies.");
                }
            }}
        ]
    },
    "cemetery": {
        x: 14, y: 8, z: 0, w: 6, h: 4, name: "Old Citadel Cemetery", icon: "skull",
        desc: "Ancient headstones jut like broken teeth from the frosted soil. Wrought-iron fences separate the noble burial plots. A winding trail leads up to the cliffside Observatory.",
        items: [], exits: { sw: "courtyard", e: "observatory_path" },
        interactions: [
            { label: "Read the oldest mausoleum inscription", action: () => updateText("'Here lie the architects of the Blackwood Spire. Their secrets buried beneath their stones.'") }
        ]
    },
    "observatory_path": {
        x: 20, y: 8, z: 0, w: 4, h: 4, name: "Observatory Cliff Path", icon: "door",
        desc: "A dizzying pathway carved into the sheer mountain granite overlooking the bottomless abyss below.",
        items: [], exits: { w: "cemetery", e: "observatory" },
        interactions: []
    },
    "observatory": {
        x: 24, y: 8, z: 0, w: 6, h: 6, name: "Star Observatory", icon: "stars",
        desc: "A soaring domed rotunda with a colossal brass refracting telescope pointing through a massive retractable aperture in the ceiling.",
        items: ["Star Map"], exits: { w: "observatory_path", n: "astrologer_chamber" },
        interactions: [
            { label: "Calibrate the Great Telescope", action: () => {
                let coords = prompt("Enter the 3-digit star coordinates into the bronze dials (e.g. 123):");
                if (coords === "429") {
                    if (!puzzleState.telescopeUnlocked) {
                        puzzleState.telescopeUnlocked = true;
                        discoverSecret("secret_telescope_serpent", "Celestial Astrolabe", "The gears whir! The telescope locks onto the Serpent constellation, causing a hidden brass iris to open and reveal the Celestial Astrolabe!");
                    } else {
                        updateText("The telescope remains locked on the blazing stars of the Serpent.");
                    }
                } else if (coords !== null) {
                    playSound('error');
                    updateText("You turn the brass dials, but the viewfinder shows only dark empty nebula. The alignment is incorrect.");
                }
            }}
        ]
    },
    "astrologer_chamber": {
        x: 24, y: 4, z: 0, w: 6, h: 4, name: "Astrologer's Chamber", icon: "book",
        desc: "The quarters of the court astrologer. Celestial globes, charts of astrological houses, and vials of powdered minerals crowd the tables.",
        items: [], exits: { s: "observatory" },
        interactions: [
            { label: "Inspect the celestial sphere", action: () => {
                if (!puzzleState.starfireCoreTaken) {
                    puzzleState.starfireCoreTaken = true;
                    takeItem("Starfire Core");
                    updateText("You align the crystal orbits of the celestial sphere. In the center glows the radiant Starfire Core!");
                } else {
                    updateText("The celestial sphere turns smoothly, its core already claimed.");
                }
            }}
        ]
    },
    "west_cloister": {
        x: 2, y: 8, z: 0, w: 4, h: 4, name: "West Cloister", icon: "door",
        desc: "An arched stone peristyle enclosing a tranquil herb garden. Leads west toward the massive Northwest Watchtower base.",
        items: [], exits: { e: "courtyard", w: "nw_tower_base", n: "dining_room" },
        interactions: []
    },
    "nw_tower_base": {
        x: -2, y: 8, z: 0, w: 4, h: 4, name: "NW Watchtower Base", icon: "door",
        desc: "The thick circular foundation of the fortress's northwestern defensive bastion. A spiral stone staircase winds upward along the curved outer wall.",
        items: ["Torch"], exits: { e: "west_cloister", u: "nw_tower_mid" },
        interactions: []
    },
    "dining_room": {
        x: 2, y: 4, z: 0, w: 6, h: 4, name: "Grand Dining Hall", icon: "table",
        desc: "A cavernous banquet hall with a twenty-foot mahogany dining table. Gilded candelabras hang overhead, covered in decades of wax drippings.",
        items: [], exits: { s: "west_cloister", e: "main_hall", n: "kitchen" },
        interactions: [
            { label: "Take the Enchanted Goblet", action: () => {
                if (!puzzleState.gobletTaken) {
                    puzzleState.gobletTaken = true;
                    takeItem("Enchanted Goblet");
                    updateText("You take the Enchanted Goblet from the head of the table. Its silver surface hums with frost.");
                } else {
                    updateText("The dining table is set with empty silver plates.");
                }
            }}
        ]
    },
    "kitchen": {
        x: 2, y: 0, z: 0, w: 6, h: 4, name: "Citadel Kitchens", icon: "fire",
        desc: "Vast iron roasting hearths, copper pots hanging from iron hooks, and thick butcher blocks scarred by decades of blades.",
        items: [], exits: { s: "dining_room", w: "pantry", d: "cold_cellar" },
        interactions: [
            { label: "Yank the Heavy Cleaver from butcher block", action: () => {
                if (!puzzleState.cleaverTaken) {
                    puzzleState.cleaverTaken = true;
                    takeItem("Heavy Cleaver");
                    updateText("With a sharp pull, you wrench the razor-sharp Heavy Cleaver from the oak block.");
                } else {
                    updateText("The butcher block bears only the deep notch where the cleaver rested.");
                }
            }}
        ]
    },
    "pantry": {
        x: -2, y: 0, z: 0, w: 4, h: 4, name: "Pantry", icon: "chest",
        desc: "A windowless storage room smelling of dried herbs and salted meats.",
        requiresLight: true, items: [], exits: { e: "kitchen" },
        interactions: [
            { label: "Search the upper pantry shelving", action: () => updateText("You search through barrels of salt and dried grains, but find nothing of further value.") }
        ]
    },
    "cold_cellar": {
        x: 2, y: -4, z: 0, w: 4, h: 4, name: "Cold Storage Cellar", icon: "chest",
        desc: "A freezing stone cellar insulated with packed mountain ice. Wooden barrels of preserved royal vintage line the walls.",
        requiresLight: true, items: ["Ancient Coin"], exits: { u: "kitchen" },
        interactions: [
            { label: "Inspect the royal vintage barrel", action: () => updateText("Resting atop a hundred-year-old oak wine cask is an ancient stamped coin.") }
        ]
    },
    "east_cloister": {
        x: 14, y: 4, z: 0, w: 4, h: 4, name: "East Cloister", icon: "door",
        desc: "The eastern vaulted walkway connecting the courtyard to the Grand Library and the Northeast Watchtower base.",
        items: [], exits: { w: "courtyard", n: "chapel", e: "ne_tower_base" },
        interactions: []
    },
    "ne_tower_base": {
        x: 18, y: 4, z: 0, w: 4, h: 4, name: "NE Tower Base", icon: "door",
        desc: "The fortified base of the northeastern tower. Arrow loops look out over the eastern mountain passes.",
        items: [], exits: { w: "east_cloister", u: "ne_tower_mid" },
        interactions: []
    },
    "library": {
        x: 14, y: 4, z: 0, w: 6, h: 6, name: "The Grand Library", icon: "book",
        desc: "A breathtaking cathedral of knowledge spanning two soaring tiers. Thousands of vellum and leather codices line towering mahogany bookcases.",
        items: ["Blue Book", "Red Book"], exits: { w: "main_hall", s: "study", u: "library_balcony" },
        interactions: [
            { label: "Pull the anomalous crooked tome", action: () => {
                if (!puzzleState.librarySecretOpened) {
                    puzzleState.librarySecretOpened = true;
                    world["library"].exits.e = "secret_archive";
                    discoverSecret("secret_crooked_book", null, "A mechanism clicks behind the wall! A massive three-tier bookcase silently pivots backward, revealing the Hidden Archive!");
                } else {
                    updateText("The hidden doorway remains open to the east.");
                }
            }}
        ]
    },
    "secret_archive": {
        x: 20, y: 4, z: 0, w: 4, h: 4, name: "The Secret Archive", icon: "chest",
        desc: "A climate-sealed vault untouched by decay. In the center, illuminated by an eternal silver sconce, sits a velvet-draped plinth.",
        items: ["Golden Book"], exits: { w: "library" },
        interactions: [
            { label: "Take the Golden Chalice from the plinth", action: () => {
                if (!puzzleState.chaliceTaken) {
                    puzzleState.chaliceTaken = true;
                    discoverSecret("secret_golden_chalice", "Golden Chalice", "You lift the revered Golden Chalice! The royal emblem of the sovereign shines with blinding luster!");
                } else {
                    updateText("The plinth stands empty.");
                }
            }}
        ]
    },
    "study": {
        x: 14, y: 10, z: 0, w: 6, h: 4, name: "Private Study", icon: "book",
        desc: "A distinguished retreat with deep leather armchairs and a heavy walnut desk. A heavy iron-bound trapdoor is set into the floorboards.",
        items: [], exits: { n: "library", d: "deep_archives" },
        interactions: [
            { label: "Search the Lord's roll-top desk", action: () => {
                if (!puzzleState.studyItemsTaken) {
                    puzzleState.studyItemsTaken = true;
                    takeItem("Brass Key");
                    takeItem("Lord's Journal");
                    takeItem("Founding Scroll");
                    updateText("Inside the locked desk compartment you find the Brass Key, the Lord's Journal, and the ancient Founding Scroll!");
                } else {
                    updateText("The desk drawers are empty.");
                }
            }}
        ]
    },

    // ------------------------------------------------------------------------
    // ELEVATION Z: 1 — NOBLE QUARTERS, BALLROOM & GRAND GALLERIES (18 Rooms)
    // ------------------------------------------------------------------------
    "upper_hall": {
        x: 8, y: 0, z: 1, w: 6, h: 6, name: "Upper Gallery of Honor", icon: "swords",
        desc: "A wide marble gallery overlooking the inner keep. Standing at rigid attention along the polished walls are exactly eight suits of full plate armor holding halberds.",
        items: [], exits: { d: "foyer", u: "sphinx_landing", e: "library_balcony", w: "ballroom", s: "master_bedroom" },
        interactions: [
            { label: "Count the ceremonial suits of armor", action: () => updateText("You count exactly 8 suits of pristine ceremonial plate armor lining the gallery walls.") }
        ]
    },
    "library_balcony": {
        x: 14, y: 0, z: 1, w: 6, h: 6, name: "Library Balcony", icon: "book",
        desc: "A cantilevered cedar walkway ringing the upper tier of the Grand Library. Leads north into the specialized Scriptorium and grand archives.",
        items: [], exits: { w: "upper_hall", d: "library", n: "scriptorium", e: "grand_archive_upper" },
        interactions: []
    },
    "grand_archive_upper": {
        x: 20, y: 0, z: 1, w: 4, h: 4, name: "Grand Archive Upper Tier", icon: "book",
        desc: "Cages of locked grimoires bound in lead and brass. Dust lies thick over forgotten histories of the realm.",
        items: [], exits: { w: "library_balcony" },
        interactions: [
            { label: "Examine the ledger of monarchs", action: () => updateText("'King Malakor the First, who forged the Citadel upon the bones of the dragon, reigning in glory.'") }
        ]
    },
    "scriptorium": {
        x: 14, y: -4, z: 1, w: 6, h: 4, name: "Scriptorium", icon: "book",
        desc: "Desks with ink horns and quills where scribes once illuminated holy manuscripts. High stained glass windows bathe the room in jewel-toned light.",
        items: [], exits: { s: "library_balcony" },
        interactions: [
            { label: "Inspect the illuminated missal", action: () => updateText("An unfinished illumination shows the King's Crown resting upon four corner stones surrounding an obsidian throne.") }
        ]
    },
    "ballroom": {
        x: 2, y: 0, z: 1, w: 6, h: 6, name: "Grand Citadel Ballroom", icon: "table",
        desc: "A breathtaking hall of polished white marble and mirrored arches. Crystal chandeliers hang from a vaulted ceiling painted with constellations.",
        items: [], exits: { e: "upper_hall", w: "music_room", n: "ballroom_balcony", s: "guest_quarters" },
        interactions: []
    },
    "ballroom_balcony": {
        x: 2, y: -4, z: 1, w: 6, h: 4, name: "Musicians' Balcony", icon: "door",
        desc: "Overlooking the grand ballroom. Music stands and empty instrument cases remain where the royal minstrels once played.",
        items: [], exits: { s: "ballroom" },
        interactions: []
    },
    "music_room": {
        x: -4, y: 0, z: 1, w: 6, h: 6, name: "Conservatory of Music", icon: "table",
        desc: "A wood-paneled salon featuring a concert harpsichord built of ebony and pearl. Sheet music rests upon the keyboard music rack.",
        items: [], exits: { e: "ballroom" },
        interactions: [
            { label: "Play the Harpsichord", action: () => {
                let melody = prompt("Enter the 4-note melody to play on the keyboard (e.g. ABCD):");
                if (melody && melody.toUpperCase() === "BACH") {
                    if (!puzzleState.harpsichordOpened) {
                        puzzleState.harpsichordOpened = true;
                        world["music_room"].exits.w = "royal_dressing";
                        discoverSecret("secret_harpsichord", null, "The chords resonate with otherworldly perfection! A mirrored wall panel glides open, revealing the Secret Royal Dressing Chamber!");
                    } else {
                        updateText("The harpsichord plays a joyful harmonic echo. The secret door is already open.");
                    }
                } else if (melody !== null) {
                    playSound('error');
                    updateText("The notes clang dissonantly. The mechanism does not respond to this sequence.");
                }
            }}
        ]
    },
    "royal_dressing": {
        x: -8, y: 0, z: 1, w: 4, h: 4, name: "Royal Dressing Chamber", icon: "chest",
        desc: "A hidden chamber lined with cedar wardrobes, full-length gold-leaf mirrors, and velvet cushions.",
        items: ["Ancient Coin"], exits: { e: "music_room" },
        interactions: [
            { label: "Search the velvet jewelry casket", action: () => updateText("Inside the silk-lined casket you discover an immaculate Ancient Coin.") }
        ]
    },
    "guest_quarters": {
        x: 2, y: 6, z: 1, w: 6, h: 4, name: "Foreign Emissary Quarters", icon: "bed",
        desc: "Lavish suites prepared for visiting ambassadors from eastern kingdoms. Embroidered tapestries depict distant desert cities.",
        items: ["Silk Handkerchief"], exits: { n: "ballroom" },
        interactions: [
            { label: "Search the bedside vanity", action: () => updateText("Resting on the marble vanity is an exquisite square of fine royal Silk Handkerchief.") }
        ]
    },
    "commander_quarters": {
        x: 8, y: 6, z: 1, w: 4, h: 4, name: "Knight-Commander's Room", icon: "swords",
        desc: "A spartan officer's chamber featuring a large tactical sand table mapping the fortress and surrounding mountain passes.",
        items: [], exits: { w: "master_bedroom" },
        interactions: [
            { label: "Examine the tactical map", action: () => updateText("Notes pinned to the map indicate a secret drainage valve mechanism hidden within the lower cistern.") }
        ]
    },
    "master_bedroom": {
        x: 8, y: 6, z: 1, w: 6, h: 6, name: "Master Bedroom", icon: "bed",
        desc: "The opulent private quarters of the Lord of Blackwood. A massive canopied bed hangs draped in ruined damask. The floor is fine hardwood.",
        locked: true, requiredKey: "Brass Key", items: [], exits: { n: "upper_hall", e: "commander_quarters" },
        interactions: [
            { label: "Inspect the uneven floorboards near the hearth", action: () => {
                if (player.inventory.includes("Crowbar") || player.inventory.includes("Heavy Cleaver")) {
                    if (!puzzleState.crownJewelTaken) {
                        puzzleState.crownJewelTaken = true;
                        discoverSecret("secret_floorboards", "Crown Jewel (Secret)", "Leveraging your heavy tool, you pry up the oak plank! In the velvet cavity beneath blazes the legendary Blackwood Diamond (Crown Jewel)!");
                    } else {
                        updateText("The hollow beneath the floorboards is empty.");
                    }
                } else {
                    playSound('error');
                    updateText("A board is loose and hollow to the tap, but it is nailed tight. You need a Crowbar or Heavy Cleaver to pry it free.");
                }
            }}
        ]
    },
    "private_chapel_balcony": {
        x: 14, y: 6, z: 1, w: 6, h: 4, name: "Chapel Choir Loft", icon: "altar",
        desc: "A private high balcony overlooking the Royal Chapel below. The pipes of a grand church organ rise toward the timber vaulting.",
        items: [], exits: { w: "upper_hall" },
        interactions: []
    },
    "nw_tower_mid": {
        x: -2, y: 8, z: 1, w: 4, h: 4, name: "NW Watchtower Mid-Level", icon: "swords",
        desc: "A circular firing platform with narrow archer slits commanding the western approaches. Spiral stairs lead further up toward the peak.",
        items: [], exits: { d: "nw_tower_base", u: "nw_tower_peak" },
        interactions: []
    },
    "ne_tower_mid": {
        x: 18, y: 4, z: 1, w: 4, h: 4, name: "NE Tower Guard Landing", icon: "door",
        desc: "A guard station with a glowing iron brazier and racks of iron crossbow bolts.",
        items: [], exits: { d: "ne_tower_base", u: "ne_tower_peak" },
        interactions: []
    },
    "clockwork_lower": {
        x: 4, y: -8, z: 1, w: 6, h: 4, name: "Clockwork Lower Chamber", icon: "gear",
        desc: "A soaring vertical chamber filled with towering interlocking bronze gears, whirring counterweights, and the rhythmic deafening thrum of clockwork.",
        items: [], exits: { s: "ballroom_balcony", u: "clocktower_apex" },
        interactions: []
    },
    "portrait_gallery": {
        x: 14, y: -8, z: 1, w: 6, h: 4, name: "Gallery of Lineage", icon: "door",
        desc: "Oil portraits of three centuries of Blackwood sovereigns stare down from gilded frames. Curiously, their eyes have been scratched out of the canvas.",
        items: [], exits: { s: "scriptorium" },
        interactions: []
    },
    "terrace_garden": {
        x: 20, y: -4, z: 1, w: 4, h: 6, name: "High Terrace Garden", icon: "tree",
        desc: "An open-air stone terrace bordered by classical balustrades. Offers a dizzying view of the courtyard and gardens below.",
        items: [], exits: { w: "grand_archive_upper" },
        interactions: []
    },
    "solar_antechamber": {
        x: 8, y: -6, z: 1, w: 6, h: 4, name: "Antechamber of the Sun", icon: "stars",
        desc: "A circular vestibule beneath a stained glass cupola depicting the dawn. Golden doors lead upward into the High Keep.",
        items: [], exits: { s: "upper_hall", u: "sphinx_landing" },
        interactions: []
    },

    // ------------------------------------------------------------------------
    // ELEVATION Z: 2 — HIGH KEEP, SPIRE & THE DARK THRONE (14 Rooms)
    // ------------------------------------------------------------------------
    "sphinx_landing": {
        x: 8, y: 0, z: 2, w: 6, h: 6, name: "The Sphinx Landing", icon: "door",
        desc: "The monumental summit plateau of the keep. Guarding the towering Golden Gate is an imposing, living stone Sphinx with glowing sapphire eyes.",
        items: [], exits: { d: "upper_hall" },
        interactions: [
            { label: "Confront the Sphinx", action: () => {
                if (!puzzleState.sphinxPassed) {
                    let ans = prompt("The Sphinx's voice rumbles like shifting stone: 'What runs but never walks, has a mouth but never talks, has a head but never weeps, has a bed but never sleeps?'");
                    if (ans && ans.toLowerCase().includes("river")) {
                        puzzleState.sphinxPassed = true;
                        world["sphinx_landing"].exits.n = "throne_room";
                        world["sphinx_landing"].exits.w = "sphinx_sanctum";
                        world["sphinx_landing"].exits.e = "bridge_of_whispers";
                        playSound('secret');
                        updateText("The Sphinx's sapphire eyes flare with ancient approval. 'Wisdom guides thee, traveler. The Golden Gates are unsealed!'");
                    } else if (ans !== null) {
                        playSound('error');
                        updateText("The Sphinx's eyes flash crimson! 'Ignorance shall not tread the apex of Blackwood!'");
                    }
                } else {
                    updateText("The Sphinx bows its majestic head as you approach.");
                }
            }}
        ]
    },
    "sphinx_sanctum": {
        x: 2, y: 0, z: 2, w: 6, h: 4, name: "Sphinx's Inner Sanctum", icon: "altar",
        desc: "A secluded chamber behind the Sphinx's pedestal filled with ancient astrological tablets.",
        items: [], exits: { e: "sphinx_landing" },
        interactions: [
            { label: "Speak the Name of the First King", action: () => {
                if (!puzzleState.sphinxSecretRevealed) {
                    let kingName = prompt("The stone runes ask: 'By whose decree was this mountain crown forged?' (Hint: Founding Scroll)");
                    if (kingName && (kingName.toLowerCase().includes("malakor") || kingName.toLowerCase().includes("blackwood"))) {
                        puzzleState.sphinxSecretRevealed = true;
                        discoverSecret("secret_sphinx_true_name", "Sphinx's Eye Opal", "A compartment in the pedestal unlocks! You receive the radiant fire opal known as the Sphinx's Eye Opal!");
                    } else if (kingName !== null) {
                        playSound('error');
                        updateText("The stone tablet remains silent.");
                    }
                } else {
                    updateText("The Sphinx's sanctuary radiates quiet ancient serenity.");
                }
            }}
        ]
    },
    "throne_room": {
        x: 8, y: -8, z: 2, w: 8, h: 8, name: "The Dark Obsidian Throne", icon: "throne",
        desc: "The absolute nexus of power in Blackwood. At the head of a flight of basalt steps rises a towering throne carved from a single meteor of black obsidian. Surrounding the dais are four carved pedestals: the Royal Plinths of the Crown, Blade, Chalice, and Diamond.",
        items: [], exits: { s: "sphinx_landing", e: "royal_treasury", w: "kings_solar", n: "sovereign_balcony" },
        interactions: [
            { label: "Place the 4 Royal Regalia on the Corner Plinths", action: () => {
                const hasCrown = player.inventory.includes("King's Crown (Secret)");
                const hasSword = player.inventory.includes("Sword of Light (Secret)");
                const hasChalice = player.inventory.includes("Golden Chalice");
                const hasJewel = player.inventory.includes("Crown Jewel (Secret)");

                if (hasCrown && hasSword && hasChalice && hasJewel) {
                    if (!puzzleState.regaliaPlaced) {
                        puzzleState.regaliaPlaced = true;
                        discoverSecret("secret_true_ascension", null, "You place the King's Crown, the Sword of Light, the Golden Chalice, and the Crown Jewel upon the four plinths! Beams of blinding gold light connect the relics in a radiant celestial circle!");
                    } else {
                        updateText("The four plinths blaze with blinding divine starlight, awaiting your coronation!");
                    }
                } else {
                    playSound('error');
                    let missing = [];
                    if (!hasCrown) missing.push("King's Crown");
                    if (!hasSword) missing.push("Sword of Light");
                    if (!hasChalice) missing.push("Golden Chalice");
                    if (!hasJewel) missing.push("Crown Jewel");
                    updateText(`The plinths remain unlit. You are still missing: ${missing.join(", ")}.`);
                }
            }},
            { label: "Ascend the Basalt Steps and Claim the Throne", action: () => {
                triggerThroneEndgame();
            }}
        ]
    },
    "royal_treasury": {
        x: 16, y: -8, z: 2, w: 6, h: 4, name: "Royal Treasury Vault", icon: "chest",
        desc: "Chests of minted coins, ceremonial scepters, and heaps of uncut gems glimmer in the torchlight.",
        items: ["Ancient Coin"], exits: { w: "throne_room" },
        interactions: [
            { label: "Inspect the treasure chests", action: () => updateText("Priceless wealth accumulated over five dynasties fills the vault.") }
        ]
    },
    "kings_solar": {
        x: 2, y: -8, z: 2, w: 6, h: 4, name: "King's Private Solar", icon: "book",
        desc: "The Lord's high sanctuary. Panoramic bay windows overlook the sprawling mountain ranges to the north.",
        items: [], exits: { e: "throne_room" },
        interactions: [
            { label: "Examine the royal ledger", action: () => updateText("The ledger chronicles the true purpose of the citadel: to seal the abyssal rift deep in the subterranean crypts.") }
        ]
    },
    "sovereign_balcony": {
        x: 8, y: -14, z: 2, w: 8, h: 4, name: "The Sovereign's High Balcony", icon: "door",
        desc: "The absolute highest platform of the citadel. The wind howls across the abyss as you gaze down upon the entire world below.",
        items: [], exits: { s: "throne_room" },
        interactions: []
    },
    "bridge_of_whispers": {
        x: 14, y: 0, z: 2, w: 6, h: 4, name: "Spire Bridge of Whispers", icon: "door",
        desc: "A breathtaking arched bridge spanning an open-air chasm between the High Keep and the Grand Clocktower. Wind screams across the granite arches.",
        items: [], exits: { w: "sphinx_landing", e: "clocktower_apex", n: "alchemical_lab" },
        interactions: []
    },
    "clocktower_apex": {
        x: 20, y: 0, z: 2, w: 6, h: 6, name: "Grand Clocktower Apex", icon: "clock",
        desc: "Inside the clockface. The immense brass pendulum swings back and forth with bone-rattling thunder above the citadel bell.",
        items: [], exits: { w: "bridge_of_whispers", d: "clockwork_lower" },
        interactions: [
            { label: "Jam the pendulum gear at the 12th strike with Crowbar", action: () => {
                if (player.inventory.includes("Crowbar")) {
                    if (!puzzleState.clockworkCogTaken) {
                        puzzleState.clockworkCogTaken = true;
                        discoverSecret("secret_clockwork_cog", "Chronomancer's Cog", "CLANG! You jam the crowbar into the central escapement! The clock freezes mid-stroke, and a glowing brass Chronomancer's Cog drops into your hands!");
                    } else {
                        updateText("The clock mechanism is halted in frozen stasis.");
                    }
                } else {
                    playSound('error');
                    updateText("The immense pendulum swings with bone-crushing force. You need a sturdy iron Crowbar to wedge between the teeth.");
                }
            }}
        ]
    },
    "alchemical_lab": {
        x: 14, y: -6, z: 2, w: 6, h: 6, name: "Arcane Alchemical Laboratory", icon: "potion",
        desc: "Tables covered in serpentine glass alembics, bubbling copper retorts, and braziers glowing with unnatural azure flames.",
        items: [], exits: { s: "bridge_of_whispers", n: "transmutation_chamber" },
        interactions: []
    },
    "transmutation_chamber": {
        x: 14, y: -12, z: 2, w: 6, h: 4, name: "Transmutation Crucible", icon: "altar",
        desc: "A sacred alchemy circle inscribed with gold leaf on the floor. In the center rests the legendary Great Crucible.",
        items: [], exits: { s: "alchemical_lab" },
        interactions: [
            { label: "Brew the Magnum Opus (Requires Nightshade, Goblet & Healing Potion)", action: () => {
                const hasSap = player.inventory.includes("Nightshade Extract");
                const hasGoblet = player.inventory.includes("Enchanted Goblet");
                const hasHeal = player.inventory.includes("Healing Potion");

                if (hasSap && hasGoblet && hasHeal) {
                    if (!puzzleState.magnumOpusBrewed) {
                        puzzleState.magnumOpusBrewed = true;
                        removeItemFromPlayer("Nightshade Extract");
                        removeItemFromPlayer("Healing Potion");
                        discoverSecret("secret_magnum_opus", "Elixir of Immortality (Secret)", "You pour the extracts into the Enchanted Goblet over the crucible flame. Golden vapors erupt as the ingredients transmute into the legendary Elixir of Immortality!");
                    } else {
                        updateText("The crucible glows with golden residue.");
                    }
                } else {
                    playSound('error');
                    updateText("To complete the Magnum Opus, you require: Nightshade Extract, the Enchanted Goblet, and a Healing Potion.");
                }
            }}
        ]
    },
    "sky_observatory": {
        x: 20, y: -8, z: 2, w: 4, h: 4, name: "Celestial Sky Observatory", icon: "stars",
        desc: "An open sky platform pointing directly at the North Star. The heavens feel close enough to touch.",
        items: [], exits: { s: "clocktower_apex" },
        interactions: []
    },
    "nw_tower_peak": {
        x: -2, y: 8, z: 2, w: 4, h: 4, name: "NW Watchtower Peak", icon: "door",
        desc: "The battlements at the peak of the northwest tower. The tattered pennant of Blackwood whips in the gale.",
        items: [], exits: { d: "nw_tower_mid" },
        interactions: []
    },
    "ne_tower_peak": {
        x: 18, y: 4, z: 2, w: 4, h: 4, name: "NE Tower Sky-Perch", icon: "skull",
        desc: "The roof platform of the northeast tower. A skeletal guard rests against a gargoyle, clutching a restorative vial.",
        items: ["Healing Potion"], exits: { d: "ne_tower_mid" },
        interactions: [
            { label: "Take the vial from the skeleton", action: () => {
                if (!puzzleState.nePotionTaken) {
                    puzzleState.nePotionTaken = true;
                    takeItem("Healing Potion");
                    updateText("You retrieve a glowing red Healing Potion from the skeleton's grip.");
                } else {
                    updateText("The skeleton sits in peace.");
                }
            }}
        ]
    },
    "spire_vault": {
        x: 8, y: -4, z: 2, w: 4, h: 4, name: "Vault of the Zenith", icon: "chest",
        desc: "A circular jewel-box chamber hovering between the throne room and the heavens.",
        items: [], exits: { s: "throne_room" },
        interactions: []
    },

    // ------------------------------------------------------------------------
    // ELEVATION Z: -1 — CITADEL DUNGEONS & CATACOMBS (16 Rooms)
    // ------------------------------------------------------------------------
    "dungeon_entrance": {
        x: 8, y: 0, z: -1, w: 6, h: 4, name: "Dungeon Entrance", icon: "door",
        desc: "The air here is freezing cold and reeking of sulfur. Water trickles down slimy granite blocks into the darkness.",
        requiresLight: true, items: [], exits: { u: "foyer", n: "cell_block", e: "wardens_office" },
        interactions: []
    },
    "wardens_office": {
        x: 14, y: 0, z: -1, w: 4, h: 4, name: "Dungeon Warden's Office", icon: "book",
        desc: "An iron desk covered in torture requisition scrolls and prisoner ledgers.",
        requiresLight: true, items: ["Warden's Log"], exits: { w: "dungeon_entrance" },
        interactions: [
            { label: "Search the Warden's iron desk drawers", action: () => {
                if (!puzzleState.wardenKeyTaken) {
                    puzzleState.wardenKeyTaken = true;
                    takeItem("Warden's Keyring");
                    updateText("Inside the heavy iron drawer you find the Warden's Keyring!");
                } else {
                    updateText("The desk contains only rusted nibs and cracked ink pots.");
                }
            }}
        ]
    },
    "cell_block": {
        x: 8, y: -6, z: -1, w: 8, h: 6, name: "Central Cell Block", icon: "skull",
        desc: "A massive subterranean chamber containing thirteen iron cages suspended over deep pits. Chained skeletons hang in agonizing poses.",
        requiresLight: true, locked: true, requiredKey: "Rusty Key", items: [],
        exits: { s: "dungeon_entrance", w: "torture_chamber", e: "oubliette_top", n: "drowned_cistern" },
        interactions: [
            { label: "Count the suspended iron cages", action: () => updateText("You count exactly 13 cages suspended by chains from the arched ceiling.") }
        ]
    },
    "torture_chamber": {
        x: 2, y: -6, z: -1, w: 6, h: 6, name: "Torture Chamber", icon: "skull",
        desc: "Grim instruments of interrogation line the blood-stained stone. An imposing iron maiden carved with screaming faces stands open in the corner.",
        requiresLight: true, items: [], exits: { e: "cell_block", s: "interrogation_room" },
        interactions: [
            { label: "Inspect the skull emblem inside the Iron Maiden", action: () => {
                if (!puzzleState.ironMaidenChuteOpened) {
                    puzzleState.ironMaidenChuteOpened = true;
                    world["torture_chamber"].exits.d = "drowned_cistern";
                    discoverSecret("secret_iron_maiden_chute", null, "You press the concealed skull emblem! The back of the iron maiden swings open, revealing a hidden chute sliding straight down into the Drowned Cistern!");
                } else {
                    updateText("The hidden escape chute inside the iron maiden remains open.");
                }
            }}
        ]
    },
    "interrogation_room": {
        x: 2, y: 0, z: -1, w: 4, h: 4, name: "Interrogation Room", icon: "skull",
        desc: "Heavy shackles bolted to the stone floor beneath low ceiling beams.",
        requiresLight: true, locked: true, requiredKey: "Warden's Keyring", items: ["Ancient Coin"], exits: { n: "torture_chamber" },
        interactions: []
    },
    "oubliette_top": {
        x: 16, y: -6, z: -1, w: 4, h: 4, name: "Oubliette Grate & Rim", icon: "skull",
        desc: "A heavy round iron grate set into the floor above a vertical abyss. From the depths rises the scent of ancient dry bones.",
        requiresLight: true, items: [], exits: { w: "cell_block" },
        interactions: [
            { label: "Tie Rope to the iron grate [Requires Rope]", action: () => {
                if (player.inventory.includes("Rope")) {
                    world["oubliette_top"].exits.d = "oubliette_bottom";
                    playSound('item');
                    updateText("You securely knot the fifty-foot rope to the iron grate and cast it into the pit. You can now climb down into the Oubliette!");
                } else {
                    playSound('error');
                    updateText("It is a sheer fifty-foot drop into jagged darkness. You need a sturdy coil of Rope.");
                }
            }}
        ]
    },
    "drowned_cistern": {
        x: 8, y: -12, z: -1, w: 8, h: 6, name: "The Drowned Cistern", icon: "water",
        desc: "A cavernous flooded vaulted reservoir. Dark water laps against crumbling masonry. Three colossal bronze pressure valves line the southern wall.",
        requiresLight: true, items: [], exits: { s: "cell_block", w: "water_pumping", e: "deep_archives" },
        interactions: [
            { label: "Turn the 3 Pressure Valves in Sequence", action: () => {
                let seq = prompt("Enter the valve pressure sequence (e.g. Low, High, Medium as 'LHM'):");
                if (seq && seq.toUpperCase() === "LHM") {
                    if (!puzzleState.cisternDrained) {
                        puzzleState.cisternDrained = true;
                        world["drowned_cistern"].exits.d = "cistern_drain";
                        discoverSecret("secret_cistern_sluice", null, "The giant sluice gates grind open with a roar of escaping water! The cistern drains completely, revealing a sunken chamber bed below!");
                    } else {
                        updateText("The sluice gates remain open; the cistern is completely drained.");
                    }
                } else if (seq !== null) {
                    playSound('error');
                    updateText("The pipes shudder and groan with violent water hammer. The valve sequence was incorrect.");
                }
            }}
        ]
    },
    "cistern_drain": {
        x: 8, y: -12, z: -1.5, w: 6, h: 4, name: "Drained Cistern Bed", icon: "chest",
        desc: "The muddy, silt-covered bed of the drained cistern. Half-buried in river silt sits an ancient iron-bound chest.",
        requiresLight: true, items: [], exits: { u: "drowned_cistern" },
        interactions: [
            { label: "Pry open the sunken chest", action: () => {
                if (!puzzleState.voidPearlTaken) {
                    puzzleState.voidPearlTaken = true;
                    discoverSecret("secret_cistern_sluice", "Abyssal Void Pearl", "You pry open the barnacle-crusted chest. Resting inside on black velvet is the Abyssal Void Pearl, radiating deep gravitational warmth!");
                } else {
                    updateText("The sunken chest sits empty in the dried silt.");
                }
            }}
        ]
    },
    "water_pumping": {
        x: 2, y: -12, z: -1, w: 6, h: 4, name: "Hydraulic Pumping Station", icon: "gear",
        desc: "Rusted bronze pistons and hydraulic counterweights that once pumped water from the mountain river to the upper fortress.",
        requiresLight: true, items: [], exits: { e: "drowned_cistern" },
        interactions: [
            { label: "Read the brass valve pressure plate", action: () => updateText("'Caution: To drain reservoir without pipe rupture, release pressure from Low, then High, then Medium.'") }
        ]
    },
    "deep_archives": {
        x: 16, y: -12, z: -1, w: 6, h: 6, name: "The Deep Archives", icon: "book",
        desc: "An underground repository for forbidden occult manuscripts. In the center stands a carved obsidian pedestal with three circular indents colored Crimson, Azure, and Gold.",
        requiresLight: true, items: [], exits: { w: "drowned_cistern", u: "study" },
        interactions: [
            { label: "Place the Red, Blue, and Golden Books on the Pedestal", action: () => {
                const hasRed = player.inventory.includes("Red Book");
                const hasBlue = player.inventory.includes("Blue Book");
                const hasGold = player.inventory.includes("Golden Book");

                if (hasRed && hasBlue && hasGold) {
                    if (!puzzleState.vaultOpened) {
                        puzzleState.vaultOpened = true;
                        world["deep_archives"].exits.e = "forbidden_vault";
                        removeItemFromPlayer("Red Book");
                        removeItemFromPlayer("Blue Book");
                        removeItemFromPlayer("Golden Book");
                        discoverSecret("secret_colored_books", null, "The three tomes sink into the stone indents with a thunderous clatter! The solid granite wall to the east dissolves in black smoke, revealing the Forbidden Vault!");
                    } else {
                        updateText("The three tomes remain embedded in the glowing pedestal.");
                    }
                } else {
                    playSound('error');
                    updateText("The pedestal indents are empty. You need the Red Book (Sun), Blue Book (Moon), and Golden Book (Empire).");
                }
            }}
        ]
    },
    "forbidden_vault": {
        x: 22, y: -12, z: -1, w: 4, h: 4, name: "The Forbidden Vault", icon: "skull",
        desc: "The chamber air crackles with terrifying void energy. In the center of a black stone altar hovers a piece of pure cosmic darkness.",
        requiresLight: true, items: [], exits: { w: "deep_archives" },
        interactions: [
            { label: "Take the Cursed Nether Relic", action: () => {
                if (!puzzleState.cursedRelicTaken) {
                    puzzleState.cursedRelicTaken = true;
                    discoverSecret("secret_cursed_relic", "Cursed Relic", "As your fingers close around the shard, horrifying voices of the Nether echo across your soul! You have seized the Cursed Relic!");
                } else {
                    updateText("The altar remains cold and shattered.");
                }
            }}
        ]
    },
    "crypt_restless": {
        x: 16, y: -18, z: -1, w: 6, h: 4, name: "Crypt of the Restless", icon: "skull",
        desc: "Burial niches cut into limestone. Cold drafts whistle through the fissures, carrying what sounds like faint weeping.",
        requiresLight: true, items: [], exits: { n: "deep_archives", s: "bone_charnel" },
        interactions: []
    },
    "bone_charnel": {
        x: 16, y: -22, z: -1, w: 6, h: 4, name: "Bone Charnel House", icon: "skull",
        desc: "Every wall is constructed of neatly stacked human skulls and femora. An altar of blackened bone stands in the center.",
        requiresLight: true, items: [], exits: { n: "crypt_restless" },
        interactions: [
            { label: "Search the bone altar niche", action: () => {
                if (!puzzleState.charnelRingTaken) {
                    puzzleState.charnelRingTaken = true;
                    takeItem("Iron Ring");
                    updateText("Within the hollow eye socket of a gilded skull on the altar, you discover an ancient runic Iron Ring.");
                } else {
                    updateText("The bone altar is silent.");
                }
            }}
        ]
    },
    "escape_tunnel": {
        x: -2, y: -6, z: -1, w: 4, h: 4, name: "Secret Escape Tunnel", icon: "door",
        desc: "A rough-hewn smuggling tunnel that once led past the fortress outer perimeter, now partially collapsed.",
        requiresLight: true, items: [], exits: { e: "torture_chamber" },
        interactions: []
    },
    "sewer_junction": {
        x: 8, y: -18, z: -1, w: 4, h: 4, name: "Citadel Sewer Junction", icon: "water",
        desc: "Ancient vaulted sewer arches where runoff water empties into subterranean fissures.",
        requiresLight: true, items: [], exits: { n: "drowned_cistern" },
        interactions: []
    },
    "dungeon_armory": {
        x: 14, y: -6, z: -1, w: 4, h: 4, name: "Executioner's Armory", icon: "swords",
        desc: "Racks of headsman's greataxes and heavy iron manacles.",
        requiresLight: true, locked: true, requiredKey: "Warden's Keyring", items: ["Ancient Coin"], exits: { w: "oubliette_top" },
        interactions: []
    },

    // ------------------------------------------------------------------------
    // ELEVATION Z: -2 — ABYSSAL DEPTHS & ANCIENT CRYPTS (12 Rooms)
    // ------------------------------------------------------------------------
    "oubliette_bottom": {
        x: 16, y: -6, z: -2, w: 4, h: 4, name: "The Oubliette Pit Bottom", icon: "skull",
        desc: "A suffocating, bone-strewn pit fifty feet below the dungeon floor. The rope you tied above dangles into the dark.",
        requiresLight: true, items: [], exits: { u: "oubliette_top", s: "crypt_entrance" },
        interactions: []
    },
    "crypt_entrance": {
        x: 16, y: -12, z: -2, w: 6, h: 6, name: "Crypt of the Forgotten", icon: "skull",
        desc: "Sprawling cyclopean catacombs carved from bedrock long before the Citadel was built. Monumental stone sarcophagi line the dark corridors.",
        requiresLight: true, items: [], exits: { n: "oubliette_bottom", w: "hall_of_ancestors", s: "tomb_of_kings", e: "subterranean_lake" },
        interactions: []
    },
    "hall_of_ancestors": {
        x: 10, y: -12, z: -2, w: 6, h: 6, name: "Hall of Ancestors", icon: "altar",
        desc: "Colossal statues of forgotten pre-human kings. At the far end hangs a cracked silver mirror coated in centuries of grime.",
        requiresLight: true, items: [], exits: { e: "crypt_entrance", s: "whispering_statues" },
        interactions: [
            { label: "Clean the soot from the ancestral mirror with Silk Handkerchief", action: () => {
                if (player.inventory.includes("Silk Handkerchief")) {
                    if (!puzzleState.mirrorCleaned) {
                        puzzleState.mirrorCleaned = true;
                        discoverSecret("secret_ancestor_mirror", null, "You buff away the soot. As the silver shines, your reflection shifts to reveal a crowned phantom pointing downward toward the Tomb of Kings!");
                    } else {
                        updateText("The clean mirror reflects a faint spectral glow in the darkness.");
                    }
                } else {
                    playSound('error');
                    updateText("The mirror is encrusted with dense greasy soot. Rubbing it with bare hands will only scratch the delicate silver. You need fine silk.");
                }
            }}
        ]
    },
    "whispering_statues": {
        x: 10, y: -18, z: -2, w: 6, h: 6, name: "Chamber of Whispering Statues", icon: "skull",
        desc: "Three hooded stone figures carved from basalt. As you step forward, their hollow eye sockets track your movements.",
        requiresLight: true, items: [], exits: { n: "hall_of_ancestors", s: "nether_sanctuary" },
        interactions: [
            { label: "Listen to the whispers of the stone idols", action: () => updateText("The idols murmur in ancient tongues: 'Only one bearing the Four Regalia of the First King can claim the throne above without perishing.'") }
        ]
    },
    "tomb_of_kings": {
        x: 16, y: -18, z: -2, w: 8, h: 8, name: "Tomb of the First King", icon: "tomb",
        desc: "A majestic underground mausoleum. Resting atop a granite dais is the colossal black marble sarcophagus of King Malakor Blackwood.",
        requiresLight: true, locked: true, requiredKey: "Tomb Key", items: [], exits: { n: "crypt_entrance" },
        interactions: [
            { label: "Heave open the First King's Sarcophagus", action: () => {
                if (!puzzleState.kingCrownTaken) {
                    puzzleState.kingCrownTaken = true;
                    discoverSecret("secret_kings_sarcophagus", "King's Crown (Secret)", "With a shudder of stone, you heave open the sarcophagus lid! Resting upon the embalmed chest of the First King is the legendary King's Crown!");
                } else {
                    updateText("The First King lies in solemn peace, his crown claimed.");
                }
            }}
        ]
    },
    "subterranean_lake": {
        x: 24, y: -12, z: -2, w: 8, h: 6, name: "Subterranean Cavern Lake", icon: "water",
        desc: "A vast natural cavern housing a black subterranean lake. Bioluminescent mushrooms cast an eerie sapphire glow over the still water.",
        requiresLight: true, items: [], exits: { w: "crypt_entrance", s: "void_shrine", e: "golem_workshop" },
        interactions: []
    },
    "void_shrine": {
        x: 24, y: -18, z: -2, w: 6, h: 6, name: "Sunken Shrine of the Deep Void", icon: "altar",
        desc: "An ancient basalt altar standing knee-deep in the subterranean lake. Runes of the Void glow softly beneath the black water.",
        requiresLight: true, items: [], exits: { n: "subterranean_lake" },
        interactions: [
            { label: "Commune with the Sunken Shrine", action: () => updateText("The water ripples. The shrine whispers: 'The true sovereign conquers both the heavens of the Spire and the darkness of the Deep.'") }
        ]
    },
    "golem_workshop": {
        x: 32, y: -12, z: -2, w: 8, h: 6, name: "Ancient Golem Workshop", icon: "gear",
        desc: "A workshop of the elder architects. Slumped against the eastern wall is a ten-foot iron colossus with an empty spherical cavity in its chest.",
        requiresLight: true, items: [], exits: { w: "subterranean_lake" },
        interactions: [
            { label: "Insert the Starfire Core into the Golem's chest", action: () => {
                if (player.inventory.includes("Starfire Core")) {
                    if (!puzzleState.golemAwakened) {
                        puzzleState.golemAwakened = true;
                        world["golem_workshop"].exits.e = "crystal_geode";
                        removeItemFromPlayer("Starfire Core");
                        discoverSecret("secret_golem_awakening", null, "The Starfire Core flares with solar fury! The Iron Golem's eyes ignite with fire! With a single earth-shattering blow, it punches clean through the solid rock wall, opening the Hidden Crystal Geode!");
                    } else {
                        updateText("The golem stands vigilant beside the shattered breach.");
                    }
                } else {
                    playSound('error');
                    updateText("The golem's chest has a spherical socket designed for a celestial energy core. You need the Starfire Core.");
                }
            }}
        ]
    },
    "crystal_geode": {
        x: 40, y: -12, z: -2, w: 6, h: 6, name: "Hidden Crystal Geode", icon: "chest",
        desc: "A breathtaking cavern lined with giant purple amethyst prisms and starlight geodes reflecting infinite light.",
        requiresLight: true, items: ["Ancient Coin"], exits: { w: "golem_workshop", s: "hollow_vault" },
        interactions: [
            { label: "Harvest glowing crystal shards", action: () => updateText("You collect sparkling crystal prisms from the cavern walls.") }
        ]
    },
    "hollow_vault": {
        x: 40, y: -18, z: -2, w: 6, h: 6, name: "The Hollow Vault of Stars", icon: "stars",
        desc: "A mirrored black stone vault where the ambient crystal light reflects into an illusion of an infinite starfield.",
        requiresLight: true, items: [], exits: { n: "crystal_geode" },
        interactions: []
    },
    "nether_sanctuary": {
        x: 10, y: -24, z: -2, w: 6, h: 6, name: "Sealed Nether Sanctuary", icon: "altar",
        desc: "The profoundest depth beneath Blackwood. A ring of floating runic stones marks the boundary of the Abyssal Rift.",
        requiresLight: true, items: [], exits: { n: "whispering_statues", s: "abyssal_rift" },
        interactions: []
    },
    "abyssal_rift": {
        x: 10, y: -30, z: -2, w: 6, h: 4, name: "The Abyssal Rift", icon: "skull",
        desc: "A sheer precipice overlooking a bottomless void where purple lightning arcs silently through eternity. Here lies the root of the Citadel's dark power.",
        requiresLight: true, items: [], exits: { n: "nether_sanctuary" },
        interactions: [
            { label: "Peer into the bottomless abyss", action: () => updateText("You gaze into the infinite dark. You realize that only by conquering the throne above can this ancient rift ever be healed or mastered.") }
        ]
    }
};

// --- PUZZLE & DYNAMIC WORLD STATE ---
let puzzleState = {
    anvilHits: 0,
    anvilOpened: false,
    maidenBlessed: false,
    bellPlaced: false,
    swordTaken: false,
    foyerKeyFound: false,
    barracksNoteFound: false,
    tombKeyFound: false,
    silverBellFound: false,
    sapCollected: false,
    astronomerLogFound: false,
    telescopeUnlocked: false,
    starfireCoreTaken: false,
    gobletTaken: false,
    cleaverTaken: false,
    librarySecretOpened: false,
    chaliceTaken: false,
    studyItemsTaken: false,
    harpsichordOpened: false,
    crownJewelTaken: false,
    sphinxPassed: false,
    sphinxSecretRevealed: false,
    regaliaPlaced: false,
    clockworkCogTaken: false,
    magnumOpusBrewed: false,
    nePotionTaken: false,
    wardenKeyTaken: false,
    ironMaidenChuteOpened: false,
    cisternDrained: false,
    voidPearlTaken: false,
    vaultOpened: false,
    cursedRelicTaken: false,
    charnelRingTaken: false,
    mirrorCleaned: false,
    kingCrownTaken: false,
    golemAwakened: false
};

// --- PLAYER STATE ---
let player = {
    currentRoom: "courtyard",
    inventory: [],
    discoveredRooms: ["courtyard"],
    discoveredSecrets: [],
    secretsFound: 0,
    turnsTaken: 0,
    endingsUnlocked: []
};

let currentMessage = null;
const SAVE_KEY = 'citadel_rpg_master_v20';

// ============================================================================
// SAVE / LOAD / EXPORT ENGINE (Browser Storage & Local PC Drive)
// ============================================================================
function getFullGameState() {
    return {
        version: "20.0",
        savedAt: new Date().toISOString(),
        player: player,
        puzzleState: puzzleState,
        roomItems: Object.fromEntries(Object.entries(world).map(([k, v]) => [k, v.items])),
        roomLocks: Object.fromEntries(Object.entries(world).map(([k, v]) => [k, v.locked])),
        roomExits: Object.fromEntries(Object.entries(world).map(([k, v]) => [k, v.exits]))
    };
}

function restoreGameState(data) {
    if (!data || !data.player) return false;
    player = data.player;
    if (data.puzzleState) puzzleState = Object.assign(puzzleState, data.puzzleState);

    if (data.roomItems) {
        for (let r in data.roomItems) {
            if (world[r]) world[r].items = data.roomItems[r];
        }
    }
    if (data.roomLocks) {
        for (let r in data.roomLocks) {
            if (world[r]) world[r].locked = data.roomLocks[r];
        }
    }
    if (data.roomExits) {
        for (let r in data.roomExits) {
            if (world[r]) world[r].exits = data.roomExits[r];
        }
    }
    return true;
}

function saveGame(manual = false) {
    try {
        const state = getFullGameState();
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        updateSaveIndicator("Saved just now");
        if (manual) {
            playSound('item');
            showToast("Game saved successfully to browser storage!");
        }
    } catch (e) {
        console.error("Save error:", e);
    }
}

function loadGame(manual = false) {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
            const data = JSON.parse(raw);
            if (restoreGameState(data)) {
                updateUI();
                if (manual) {
                    playSound('item');
                    showToast("Game loaded from browser storage!");
                }
                return true;
            }
        }
    } catch (e) {
        console.error("Load error:", e);
    }
    if (manual) {
        playSound('error');
        showToast("No existing save found!");
    }
    return false;
}

// Download .json save file directly to user's PC drive
function exportSaveToFile() {
    try {
        const state = getFullGameState();
        const json = JSON.stringify(state, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateStr = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `blackwood_citadel_save_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        playSound('item');
        showToast("Save file exported to your local drive!");
    } catch (e) {
        console.error("Export error:", e);
        showToast("Failed to export save file.");
    }
}

// Upload & restore .json save file from user's PC drive
function importSaveFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (restoreGameState(data)) {
                saveGame(false);
                updateUI();
                playSound('secret');
                showToast("Save file imported successfully!");
            } else {
                throw new Error("Invalid format");
            }
        } catch (err) {
            console.error("Import error:", err);
            playSound('error');
            alert("Could not load save file. Please ensure it is a valid Blackwood Citadel save JSON.");
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function confirmResetGame() {
    if (confirm("Are you sure you want to embark on a completely new expedition? All current progress will be reset.")) {
        localStorage.removeItem(SAVE_KEY);
        window.location.reload();
    }
}

function updateSaveIndicator(text) {
    const el = document.getElementById('save-status-indicator');
    if (el) el.innerText = text;
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = msg;
    toast.classList.remove('hidden');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
        toast.classList.add('hidden');
    }, 3200);
}

// ============================================================================
// GAMEPLAY MECHANICS & INVENTORY
// ============================================================================
function takeItem(item) {
    if (!player.inventory.includes(item)) {
        player.inventory.push(item);
        playSound('item');
        showToast(`Acquired: [${item}]`);
    }
}

function removeItemFromPlayer(item) {
    player.inventory = player.inventory.filter(i => i !== item);
}

function updateText(text) {
    currentMessage = text;
    const storyEl = document.getElementById('story-text');
    if (storyEl) {
        storyEl.innerHTML = `<div class="story-event">${text}</div>`;
    }
}

function discoverSecret(secretId, rewardItem, narrativeText) {
    if (!player.discoveredSecrets.includes(secretId)) {
        player.discoveredSecrets.push(secretId);
        player.secretsFound = player.discoveredSecrets.length;
        playSound('secret');
        const secInfo = secretsCatalog[secretId] || { name: "Arcane Secret" };
        showToast(`✨ Arcane Secret Unlocked: ${secInfo.name}!`);
        if (rewardItem) {
            takeItem(rewardItem);
        }
        updateText(narrativeText);
        saveGame(false);
    }
}

// ============================================================================
// UI RENDERING ENGINE
// ============================================================================
function updateUI() {
    const room = world[player.currentRoom];
    if (!room) return;

    // Elevation tag
    const floorNames = {
        "2": "The Spire & High Keep (Z: +2)",
        "1": "Noble Quarters & Grand Halls (Z: +1)",
        "0": "Citadel Grounds & Lower Keep (Z: 0)",
        "-1": "Dungeons & Catacombs (Z: -1)",
        "-2": "Abyssal Depths & Ancient Crypts (Z: -2)"
    };
    const floorLabel = floorNames[room.z.toString()] || `Elevation: Z: ${room.z}`;
    document.getElementById('room-floor-tag').innerText = floorLabel;
    document.getElementById('elevation-text').innerText = floorLabel;

    // Room Name & Description
    document.getElementById('room-name').innerText = room.name;
    const storyEl = document.getElementById('story-text');
    
    let descHtml = `<p>${room.desc}</p>`;
    if (room.requiresLight && !player.inventory.includes("Torch") && !player.inventory.includes("Sword of Light (Secret)")) {
        descHtml = `<p class="gold-text">⚠️ It is pitch black here. Shadows swallow every stone. You stumble blindly without a Torch or the Sword of Light!</p>`;
    }
    
    if (currentMessage) {
        descHtml += `<div class="story-event">${currentMessage}</div>`;
    }
    storyEl.innerHTML = descHtml;

    // Render Actions & Navigation
    renderActions(room);
    renderNavigation(room);

    // Sidebar Inventory
    renderInventory();

    // Exploration Tracker
    const totalRooms = Object.keys(world).length;
    const discoveredCount = player.discoveredRooms.length;
    const percent = Math.min(100, Math.round((discoveredCount / totalRooms) * 100));

    document.getElementById('rooms-count').innerText = discoveredCount;
    document.getElementById('total-rooms-count').innerText = totalRooms;
    document.getElementById('rooms-percent').innerText = `${percent}%`;
    document.getElementById('rooms-progress').style.width = `${percent}%`;

    document.getElementById('secrets-count').innerText = player.secretsFound;
    document.getElementById('secrets-progress').style.width = `${Math.min(100, (player.secretsFound / 20) * 100)}%`;

    // Redraw map if modal is open
    if (!document.getElementById('map-modal').classList.contains('hidden')) {
        drawCitadelMap();
    }
}

function renderInventory() {
    const list = document.getElementById('inventory-list');
    list.innerHTML = '';
    document.getElementById('inv-count').innerText = `${player.inventory.length} items`;

    if (player.inventory.length === 0) {
        list.innerHTML = '<li class="empty-inv">Satchel is empty</li>';
        return;
    }

    player.inventory.forEach(item => {
        const li = document.createElement('li');
        li.innerText = item;
        if (item.includes("(Secret)")) {
            li.className = 'item-secret';
        }
        li.onclick = () => showItemDescription(item);
        list.appendChild(li);
    });
}

function showItemDescription(itemName) {
    const box = document.getElementById('item-description-box');
    const nameEl = document.getElementById('item-desc-name');
    const textEl = document.getElementById('item-desc-text');
    const typeEl = document.getElementById('item-desc-type');
    
    const info = itemsDB[itemName] || { desc: "An ancient artifact of unknown origin.", type: "Relic" };
    nameEl.innerText = itemName;
    textEl.innerText = info.desc;
    typeEl.innerText = info.type || "Relic";
    box.classList.remove('hidden');
    playSound('item');
}

function renderActions(room) {
    const container = document.getElementById('choices-container');
    container.innerHTML = '';

    // Take Ground Items
    if (room.items && room.items.length > 0) {
        room.items.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn action-inspect';
            btn.innerHTML = `✨ Take [${item}]`;
            btn.onclick = () => {
                player.inventory.push(item);
                room.items = room.items.filter(i => i !== item);
                if (item.includes("(Secret)")) {
                    player.secretsFound++;
                }
                playSound('item');
                updateText(`You picked up the ${item}.`);
                saveGame(false);
                renderActions(room);
                renderInventory();
            };
            container.appendChild(btn);
        });
    }

    // Room Interactions
    if (room.interactions && room.interactions.length > 0) {
        room.interactions.forEach(int => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerHTML = `🔍 ${int.label}`;
            btn.onclick = () => {
                int.action(room);
                renderActions(room);
                saveGame(false);
            };
            container.appendChild(btn);
        });
    }

    if (container.children.length === 0) {
        const p = document.createElement('span');
        p.style.color = '#73695c';
        p.style.fontSize = '0.9em';
        p.style.fontStyle = 'italic';
        p.innerText = 'No prominent objects demand immediate inspection.';
        container.appendChild(p);
    }
}

function renderNavigation(room) {
    const container = document.getElementById('navigation-container');
    container.innerHTML = '';

    const dirLabels = {
        n: "North", s: "South", e: "East", w: "West",
        ne: "Northeast", nw: "Northwest", se: "Southeast", sw: "Southwest",
        u: "Upward Stair", d: "Downward Stair"
    };

    for (let dir in room.exits) {
        const targetId = room.exits[dir];
        const targetRoom = world[targetId];
        if (!targetRoom) continue;

        const btn = document.createElement('button');
        btn.className = 'choice-btn nav-btn';
        if (dir === 'u' || dir === 'd') btn.classList.add('stairs-nav');

        let dirTitle = dirLabels[dir] || dir.toUpperCase();
        let isDiscovered = player.discoveredRooms.includes(targetId);
        let destination = isDiscovered ? targetRoom.name : "Uncharted Chamber";

        if (targetRoom.locked) {
            if (targetRoom.passcode) {
                btn.innerHTML = `🔒 Enter Code to go ${dirTitle} (${destination})`;
                btn.onclick = () => {
                    let code = prompt(`The heavy gate leading ${dirTitle} is sealed with an ancient combination dial. Enter the code:`);
                    if (code === targetRoom.passcode) {
                        targetRoom.locked = false;
                        playSound('door');
                        updateText(`The heavy mechanism clicks. The passage ${dirTitle} swings open!`);
                        saveGame(false);
                        renderNavigation(room);
                    } else if (code !== null) {
                        playSound('error');
                        updateText("The combination was incorrect. The barrier remains sealed.");
                    }
                };
            } else {
                let keyReq = targetRoom.requiredKey || "Special Key";
                if (player.inventory.includes(keyReq)) {
                    btn.innerHTML = `🔑 Unlock path ${dirTitle} with [${keyReq}]`;
                    btn.onclick = () => {
                        targetRoom.locked = false;
                        playSound('door');
                        updateText(`You turn the ${keyReq} in the heavy lock. The way ${dirTitle} opens!`);
                        saveGame(false);
                        renderNavigation(room);
                    };
                } else {
                    btn.innerHTML = `🔒 Sealed ${dirTitle} [Requires: ${keyReq}]`;
                    btn.disabled = true;
                }
            }
        } else {
            btn.innerHTML = `➔ Go ${dirTitle}: <strong style="color:#fff;">${destination}</strong>`;
            btn.onclick = () => {
                player.currentRoom = targetId;
                player.turnsTaken++;
                if (!player.discoveredRooms.includes(targetId)) {
                    player.discoveredRooms.push(targetId);
                }
                currentMessage = null;
                playSound('footstep');
                document.getElementById('item-description-box').classList.add('hidden');
                saveGame(false);
                updateUI();
            };
        }
        container.appendChild(btn);
    }
}

// ============================================================================
// EPIC ENDGAME & VICTORY CELEBRATION
// ============================================================================
function triggerThroneEndgame() {
    const hasCrown = player.inventory.includes("King's Crown (Secret)");
    const hasSword = player.inventory.includes("Sword of Light (Secret)");
    const hasChalice = player.inventory.includes("Golden Chalice");
    const hasJewel = player.inventory.includes("Crown Jewel (Secret)");
    const hasNether = player.inventory.includes("Cursed Relic");
    const allSecrets = player.secretsFound >= 20;

    let endingType = "usurper";
    let title = "The Shadow Usurper";
    let badge = "UNWORTHY ASCENSION";
    let crest = "👑";
    let story = "";

    if (puzzleState.regaliaPlaced || (hasCrown && hasSword && hasChalice && hasJewel)) {
        if (allSecrets) {
            endingType = "grandmaster";
            title = "The Immortal Sovereign & Grandmaster of Secrets";
            badge = "100% COMPLETION - ULTIMATE ASCENSION";
            crest = "⭐";
            story = "You mount the basalt stairs of the Dark Throne with all twenty arcane secrets revealed and the four sacred Royal Regalia consecrated upon the plinths! The ancient curse that bound Blackwood for centuries shatters in a blinding explosion of starlight and celestial dawn! The realm bows before its true immortal monarch, whose name shall resonate across songs for ten thousand years!";
        } else {
            endingType = "radiant";
            title = "The Radiant Sovereign of Dawn";
            badge = "TRUE ROYAL ASCENSION";
            crest = "👑";
            story = "As you take your seat upon the obsidian throne crowned with the King's Crown and bearing the Sword of Light, celestial gold fire courses through the veins of the fortress. The skies clear of ash for the first time in three hundred years! You have restored peace and dominion to the Kingdom of Blackwood!";
        }
    } else if (hasNether) {
        endingType = "void";
        title = "The Abyssal Void Monarch";
        badge = "DARK APOTHEOSIS";
        crest = "🔮";
        story = "You ascend the throne clutching the Cursed Nether Relic. The ancient runes of the abyss ignite in screaming violet flames! The mountain trembles as the bottomless void claims the citadel as its eternal earthly gateway. You do not merely rule the keep—you have become the living heart of the shadow itself.";
    } else {
        endingType = "usurper";
        title = "The Hollow Usurper";
        badge = "PRECARIOUS VICTORY";
        crest = "⚔️";
        story = "You sit upon the cold obsidian throne without uniting the Four Royal Regalia of King Malakor. The castle trembles in ominous silence. While you have conquered the physical walls, the deeper mysteries and ancient spirits of Blackwood remain lurking in the shadows, waiting for a worthy ruler to claim the dawn.";
    }

    // Update modal elements
    document.getElementById('victory-crest').innerText = crest;
    document.getElementById('victory-badge').innerText = badge;
    document.getElementById('victory-title').innerText = title;
    document.getElementById('victory-prose').innerText = story;

    const totalRooms = Object.keys(world).length;
    document.getElementById('vstat-rooms').innerText = `${player.discoveredRooms.length} / ${totalRooms}`;
    document.getElementById('vstat-secrets').innerText = `${player.secretsFound} / 20`;
    document.getElementById('vstat-ending').innerText = title;
    document.getElementById('vstat-turns').innerText = player.turnsTaken;

    // Relics showcase
    const relicsDiv = document.getElementById('relics-list');
    relicsDiv.innerHTML = '';
    const keyRelics = [
        "King's Crown (Secret)", "Sword of Light (Secret)", "Golden Chalice", "Crown Jewel (Secret)",
        "Cursed Relic", "Celestial Astrolabe", "Starlight Pearl", "Chronomancer's Cog",
        "Abyssal Void Pearl", "Sphinx's Eye Opal", "Elixir of Immortality (Secret)"
    ];
    keyRelics.forEach(rel => {
        if (player.inventory.includes(rel)) {
            const span = document.createElement('span');
            span.className = 'relic-chip';
            span.innerHTML = `💎 ${rel}`;
            relicsDiv.appendChild(span);
        }
    });

    if (relicsDiv.children.length === 0) {
        relicsDiv.innerHTML = '<span style="color:#73695c;font-style:italic;">No legendary relics assembled.</span>';
    }

    // Show modal & start celebration particles
    document.getElementById('victory-modal').classList.remove('hidden');
    playSound('fanfare');
    startVictoryParticles(endingType);
}

function closeVictoryModal() {
    document.getElementById('victory-modal').classList.add('hidden');
    stopVictoryParticles();
}

// Canvas particle celebration
let particleAnimId = null;
function startVictoryParticles(type) {
    const canvas = document.getElementById('victory-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    const colors = type === 'void' 
        ? ['#9333ea', '#c084fc', '#3b0764', '#f3e8ff'] 
        : ['#d4af37', '#fae082', '#fff', '#967d4f', '#ff7849'];

    for (let i = 0; i < 120; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 5 + 2,
            speedY: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 1.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: Math.random() * 0.8 + 0.2
        });
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.opacity;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            p.y += p.speedY;
            p.x += p.speedX;
            if (p.y > canvas.height) {
                p.y = -10;
                p.x = Math.random() * canvas.width;
            }
        });
        ctx.globalAlpha = 1;
        particleAnimId = requestAnimationFrame(render);
    }
    render();
}

function stopVictoryParticles() {
    if (particleAnimId) {
        cancelAnimationFrame(particleAnimId);
        particleAnimId = null;
    }
}

// ============================================================================
// PARCHMENT CARTOGRAPHER'S MAP (Interactive Canvas)
// ============================================================================
let mapCanvas = null;
let mapCtx = null;
let currentMapZ = 0;
let mapScale = 1.05;
let mapOffsetX = 0;
let mapOffsetY = 0;
let mapIsDragging = false;
let mapDragStartX = 0;
let mapDragStartY = 0;
const MAP_UNIT = 34; // Enhanced grid scale for clarity

function toggleMap() {
    const modal = document.getElementById('map-modal');
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        currentMapZ = world[player.currentRoom].z;
        initMapCanvas();
        renderMapFloorTabs();
        recenterMap();
    } else {
        modal.classList.add('hidden');
        const tip = document.getElementById('map-room-tooltip');
        if (tip) tip.classList.add('hidden');
    }
}

function initMapCanvas() {
    mapCanvas = document.getElementById('citadel-map-canvas');
    if (!mapCanvas) return;
    mapCtx = mapCanvas.getContext('2d');

    const wrapper = document.getElementById('map-canvas-container');
    mapCanvas.width = wrapper.clientWidth;
    mapCanvas.height = wrapper.clientHeight;

    // Dragging listeners
    let dragDistance = 0;
    wrapper.onmousedown = (e) => {
        mapIsDragging = true;
        dragDistance = 0;
        mapDragStartX = e.clientX - mapOffsetX;
        mapDragStartY = e.clientY - mapOffsetY;
    };
    window.onmousemove = (e) => {
        if (!mapIsDragging) return;
        dragDistance += Math.abs(e.movementX) + Math.abs(e.movementY);
        mapOffsetX = e.clientX - mapDragStartX;
        mapOffsetY = e.clientY - mapDragStartY;
        drawCitadelMap();
    };
    window.onmouseup = (e) => {
        mapIsDragging = false;
        // If it was a quick click rather than a drag, check if user clicked a room
        if (dragDistance < 6) {
            handleMapCanvasClick(e);
        }
    };

    wrapper.onwheel = (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
        const rect = mapCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        mapOffsetX = mouseX - (mouseX - mapOffsetX) * zoomFactor;
        mapOffsetY = mouseY - (mouseY - mapOffsetY) * zoomFactor;
        mapScale = Math.min(Math.max(0.4, mapScale * zoomFactor), 3.0);
        drawCitadelMap();
    };

    window.onresize = () => {
        if (!modalIsHidden()) {
            mapCanvas.width = wrapper.clientWidth;
            mapCanvas.height = wrapper.clientHeight;
            drawCitadelMap();
        }
    };
}

function handleMapCanvasClick(e) {
    if (!mapCanvas) return;
    const rect = mapCanvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - mapOffsetX) / mapScale;
    const clickY = (e.clientY - rect.top - mapOffsetY) / mapScale;

    const tooltip = document.getElementById('map-room-tooltip');

    for (let id in world) {
        const r = world[id];
        if (r.z !== currentMapZ) continue;
        if (!player.discoveredRooms.includes(id)) continue;

        const rx = r.x * MAP_UNIT;
        const ry = r.y * MAP_UNIT;
        const rw = r.w * MAP_UNIT;
        const rh = r.h * MAP_UNIT;

        if (clickX >= rx && clickX <= rx + rw && clickY >= ry && clickY <= ry + rh) {
            // Clicked this discovered room!
            document.getElementById('tooltip-title').innerText = r.name;
            const floorNames = { "2": "The Spire (+2)", "1": "Noble Halls (+1)", "0": "Grounds & Keep (0)", "-1": "Dungeons (-1)", "-2": "Ancient Crypts (-2)" };
            document.getElementById('tooltip-floor').innerText = floorNames[r.z.toString()] || `Floor Z: ${r.z}`;
            document.getElementById('tooltip-desc').innerText = r.desc.length > 120 ? r.desc.slice(0, 117) + "..." : r.desc;
            
            tooltip.style.left = `${e.clientX - rect.left}px`;
            tooltip.style.top = `${e.clientY - rect.top}px`;
            tooltip.classList.remove('hidden');
            playSound('item');
            return;
        }
    }
    if (tooltip) tooltip.classList.add('hidden');
}

function modalIsHidden() {
    return document.getElementById('map-modal').classList.contains('hidden');
}

function renderMapFloorTabs() {
    const container = document.getElementById('level-tabs');
    container.innerHTML = '';

    const floors = [
        { z: 2, label: "Floor 2: The Spire" },
        { z: 1, label: "Floor 1: Noble Halls" },
        { z: 0, label: "Floor 0: Grounds & Keep" },
        { z: -1, label: "Basement -1: Dungeons" },
        { z: -2, label: "Basement -2: Crypts" }
    ];

    floors.forEach(f => {
        const btn = document.createElement('button');
        btn.className = `parchment-tab ${f.z === currentMapZ ? 'active' : ''}`;
        btn.innerText = f.label;
        btn.onclick = () => {
            currentMapZ = f.z;
            renderMapFloorTabs();
            recenterMap();
            const tip = document.getElementById('map-room-tooltip');
            if (tip) tip.classList.add('hidden');
        };
        container.appendChild(btn);
    });
}

function recenterMap() {
    if (!mapCanvas) return;
    const currentRoom = world[player.currentRoom];
    let focusX = 10, focusY = 0;
    if (currentRoom && currentRoom.z === currentMapZ) {
        focusX = currentRoom.x + currentRoom.w / 2;
        focusY = currentRoom.y + currentRoom.h / 2;
    }

    mapOffsetX = (mapCanvas.width / 2) - (focusX * MAP_UNIT * mapScale);
    mapOffsetY = (mapCanvas.height / 2) - (focusY * MAP_UNIT * mapScale);
    drawCitadelMap();
}

function zoomInMap() {
    mapScale = Math.min(3.0, mapScale * 1.25);
    drawCitadelMap();
}

function zoomOutMap() {
    mapScale = Math.max(0.4, mapScale * 0.8);
    drawCitadelMap();
}

function resetZoomMap() {
    mapScale = 1.05;
    recenterMap();
}

// Cartographic Canvas Rendering
function drawCitadelMap() {
    if (!mapCtx || !mapCanvas) return;
    const ctx = mapCtx;
    const W = mapCanvas.width;
    const H = mapCanvas.height;

    ctx.clearRect(0, 0, W, H);

    ctx.save();
    ctx.translate(mapOffsetX, mapOffsetY);
    ctx.scale(mapScale, mapScale);

    // Subtle background cartographic coordinate lines
    ctx.strokeStyle = "rgba(70, 50, 30, 0.08)";
    ctx.lineWidth = 1;
    const gridSize = MAP_UNIT * 2;
    for (let x = -2000; x < 3000; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, -2000);
        ctx.lineTo(x, 3000);
        ctx.stroke();
    }
    for (let y = -2000; y < 3000; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(-2000, y);
        ctx.lineTo(3000, y);
        ctx.stroke();
    }

    // 1. Draw Hallway Corridors between connected rooms on this floor
    for (let id in world) {
        const r = world[id];
        if (r.z !== currentMapZ) continue;
        const isDiscovered = player.discoveredRooms.includes(id);

        for (let dir in r.exits) {
            const adjId = r.exits[dir];
            const adj = world[adjId];
            if (!adj || adj.z !== currentMapZ) continue;

            const isAdjDiscovered = player.discoveredRooms.includes(adjId);
            if (!isDiscovered && !isAdjDiscovered) continue;

            const rCenterX = (r.x + r.w / 2) * MAP_UNIT;
            const rCenterY = (r.y + r.h / 2) * MAP_UNIT;
            const adjCenterX = (adj.x + adj.w / 2) * MAP_UNIT;
            const adjCenterY = (adj.y + adj.h / 2) * MAP_UNIT;

            ctx.beginPath();
            ctx.moveTo(rCenterX, rCenterY);
            ctx.lineTo(adjCenterX, adjCenterY);

            if (r.locked || adj.locked) {
                ctx.strokeStyle = "#802e2e";
                ctx.lineWidth = 4;
                ctx.stroke();
            } else if (isDiscovered && isAdjDiscovered) {
                ctx.strokeStyle = "#5a442d";
                ctx.lineWidth = 6;
                ctx.stroke();
                ctx.strokeStyle = "#eedec7";
                ctx.lineWidth = 3;
                ctx.stroke();
            } else {
                ctx.strokeStyle = "rgba(90, 70, 50, 0.4)";
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 4]);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }
    }

    // 2. Draw Rooms
    for (let id in world) {
        const r = world[id];
        if (r.z !== currentMapZ) continue;

        const isDiscovered = player.discoveredRooms.includes(id);
        const isCurrent = (id === player.currentRoom);
        
        let isAdjacent = false;
        if (!isDiscovered) {
            for (let dir in r.exits) {
                if (player.discoveredRooms.includes(r.exits[dir])) {
                    isAdjacent = true;
                    break;
                }
            }
        }

        if (!isDiscovered && !isAdjacent) continue;

        const rx = r.x * MAP_UNIT;
        const ry = r.y * MAP_UNIT;
        const rw = r.w * MAP_UNIT;
        const rh = r.h * MAP_UNIT;

        if (isDiscovered) {
            // Discovered Room
            ctx.fillStyle = isCurrent ? "#faf3e3" : "#e6d7bf";
            ctx.strokeStyle = isCurrent ? "#ab3737" : "#3d2d1d";
            ctx.lineWidth = isCurrent ? 3 : 2;

            ctx.fillRect(rx, ry, rw, rh);
            ctx.strokeRect(rx, ry, rw, rh);

            // Double inner border for cartographic elegance
            ctx.strokeStyle = isCurrent ? "rgba(171, 55, 55, 0.3)" : "rgba(60, 45, 25, 0.25)";
            ctx.lineWidth = 1;
            ctx.strokeRect(rx + 3, ry + 3, rw - 6, rh - 6);

            // Room Title at the top of the chamber
            ctx.fillStyle = "#2b2014";
            ctx.font = "bold 9.5px 'Cinzel', Georgia, serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            
            // Format / truncate name if needed
            let displayName = r.name;
            if (displayName.length > 18 && rw < 130) {
                displayName = displayName.slice(0, 16) + "..";
            }
            ctx.fillText(displayName, rx + rw / 2, ry + 6);

            // Room Icon Emoji in center
            const icons = {
                fountain: "⛲", altar: "⛪", throne: "👑", tomb: "⚰️", skull: "💀",
                swords: "⚔️", book: "📖", tree: "🌿", fire: "🔥", chest: "💎",
                clock: "⚙️", stars: "✨", water: "💧", gate: "🏰", door: "🚪"
            };
            const iconChar = icons[r.icon] || "✦";
            ctx.font = "14px sans-serif";
            ctx.textBaseline = "middle";
            ctx.fillText(iconChar, rx + rw / 2, ry + rh / 2 + 7);

            // Elevation badges for vertical stairs
            for (let dir in r.exits) {
                if (dir === 'u') {
                    ctx.fillStyle = "#ab3737";
                    ctx.font = "bold 8.5px sans-serif";
                    ctx.textAlign = "right";
                    ctx.textBaseline = "top";
                    ctx.fillText("▲ UP", rx + rw - 5, ry + 6);
                } else if (dir === 'd') {
                    ctx.fillStyle = "#275080";
                    ctx.font = "bold 8.5px sans-serif";
                    ctx.textAlign = "right";
                    ctx.textBaseline = "bottom";
                    ctx.fillText("▼ DN", rx + rw - 5, ry + rh - 5);
                }
            }
        } else if (isAdjacent) {
            // Faint Mystery Chamber (Unexplored adjacent)
            ctx.fillStyle = "rgba(195, 175, 145, 0.35)";
            ctx.strokeStyle = "#857055";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.fillRect(rx, ry, rw, rh);
            ctx.strokeRect(rx, ry, rw, rh);
            ctx.setLineDash([]);

            ctx.fillStyle = "#5c4832";
            ctx.font = "bold 14px 'Cinzel', serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("?", rx + rw / 2, ry + rh / 2);
        }
    }

    // 3. Draw Player Beacon / Token
    const curRoom = world[player.currentRoom];
    if (curRoom && curRoom.z === currentMapZ) {
        const px = (curRoom.x + curRoom.w / 2) * MAP_UNIT;
        const py = (curRoom.y + curRoom.h / 2) * MAP_UNIT + 7;

        // Pulsing Golden Ring
        ctx.beginPath();
        ctx.arc(px, py, 13, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(212, 175, 55, 0.4)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 6.5, 0, Math.PI * 2);
        ctx.fillStyle = "#d4af37";
        ctx.strokeStyle = "#501616";
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
    }

    ctx.restore();
}

// ============================================================================
// INITIALIZATION & EVENT LISTENERS
// ============================================================================
window.onload = () => {
    // Try restoring save or initializing fresh
    if (!loadGame(false)) {
        player.currentRoom = "courtyard";
        player.discoveredRooms = ["courtyard"];
        saveGame(false);
    }
    updateUI();
};
