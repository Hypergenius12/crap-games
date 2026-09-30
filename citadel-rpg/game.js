// --- ITEM DATABASE (LORE & CLUES) ---
const itemsDB = {
    "Rusty Key": "A heavy iron key covered in flaking red rust. The teeth are jagged and uneven.",
    "Enchanted Goblet": "A perfectly polished silver goblet. It is ice cold to the touch and hums faintly.",
    "Heavy Cleaver": "A massive butcher's tool. The blade is nicked but still razor sharp.",
    "Rope": "A fifty-foot coil of sturdy hemp rope. Smells strongly of tar.",
    "Torch": "A wooden brand wrapped in pitch-soaked rags. It burns with a steady, bright flame.",
    "Crowbar": "A solid iron prybar. Perfect for forcing open sealed crates or jammed doors.",
    "Brass Key": "A small, ornate brass key with a falcon crest on the bow.",
    "Lord's Journal": "A leather-bound journal. The final entry reads: 'The Chapel must be sealed. The code is the year the Citadel was founded: 1472.'",
    "Guard's Note": "A crumpled piece of parchment: 'I locked the Western Armory. The passcode is the exact number of armor suits standing in the Upper Hallway.'",
    "Astronomer's Log": "A dusty book: 'Point the telescope at the constellation of the Serpent to reveal the truth.'",
    "Healing Potion": "A small glass vial filled with glowing red liquid. It smells like cinnamon.",
    "Iron Ring": "A heavy iron ring taken from a skeleton. It has strange runes etched into it.",
    "Ancient Coin": "A gold coin from an empire that fell thousands of years ago.",
    "Golden Chalice": "A priceless artifact stolen from the royal treasury.",
    "Crown Jewel (Secret)": "The legendary Blackwood Diamond. It is as big as a fist and perfectly cut.",
    "Silver Bell": "A small silver bell. Ringing it produces no sound. The base is shaped strangely, like a key.",
    "Sword of Light (Secret)": "A blade forged from pure, solidified light. It weighs almost nothing.",
    "Star Map": "A map of the night sky. The Serpent constellation is marked with the coordinates: 4-2-9.",
    "Tomb Key": "A heavy stone key carved in the shape of a skull.",
    "Nightshade Extract": "A highly toxic, dark purple liquid.",
    "King's Crown (Secret)": "The ancient, tarnished crown of the first ruler of the Citadel.",
    "Blue Book": "A book bound in blue leather. The title is 'Tides of the Moon'.",
    "Red Book": "A book bound in crimson leather. The title is 'Flames of the Sun'.",
    "Golden Book": "A book bound in gold leaf. The title is 'Dawn of the Empire'."
};

// --- GAME DATA ---
const world = {
    // === LEVEL 0 - GROUND FLOOR ===
    "courtyard": { x: 6, y: 4, z: 0, w: 8, h: 6, name: "The Grand Courtyard", desc: "You stand in a massive open courtyard. Dead vines cling to the high stone walls. A massive set of double doors leads South into the main keep. To the North is the Royal Chapel.", items: [], exits: { s: "main_hall", n: "chapel", w: "west_cloister", e: "east_cloister" }, interactions: [], features: [
        { type: "fountain", x: 3, y: 2, w: 2, h: 2 }
    ]},
    
    "main_hall": { x: 8, y: 10, z: 0, w: 4, h: 4, name: "Main Hall", desc: "The grand entrance hall of the citadel. The floor is covered in thick dust.", items: [], exits: { n: "courtyard", s: "foyer" }, interactions: [
        { label: "Inspect the west wall tapestry", action: (r) => { 
            let msg = "You pull back the heavy tapestry. Behind it is a solid stone wall, but there is a small indentation shaped exactly like a bell.";
            if (player.inventory.includes("Silver Bell") && !r.bellPlaced) {
                r.interactions.push({ label: "Place the Silver Bell in the wall", action: (r2) => {
                    r2.bellPlaced = true;
                    world["main_hall"].exits.w = "hidden_armory";
                    player.secretsFound++;
                    updateText("You press the Silver Bell into the indentation. The stone wall grinds open, revealing a hidden room in the center of the castle!");
                    removeInteraction(r2, r2.interactions.length - 1);
                    removeInteraction(r2, 0); 
                    updateUI();
                }});
                updateText(msg + " You realize the Silver Bell you found fits perfectly!");
            } else {
                updateText(msg);
            }
        }}
    ], features: [
        { type: "carpet", x: 1.5, y: 0, w: 1, h: 4 }
    ]},

    "hidden_armory": { x: 6, y: 10, z: 0, w: 2, h: 4, name: "Hidden Vault", desc: "A secret room perfectly concealed between the Main Hall and the West Cloister. Racks of pristine, glowing weapons line the walls.", items: [], exits: { e: "main_hall" }, interactions: [
        { label: "Take the glowing sword", action: (r) => { takeItem("Sword of Light (Secret)"); player.secretsFound++; updateText("You pull the legendary sword from its stone pedestal."); removeInteraction(r, 0); } }
    ], features: [
        { type: "altar", x: 0.5, y: 1.5, w: 1, h: 1 }
    ]},
    
    "foyer": { x: 8, y: 14, z: 0, w: 4, h: 3, name: "South Foyer", desc: "A smaller antechamber. A set of dark stairs leads down to the Dungeon. The shattered main gates lead South into the Guard Wing.", items: [], exits: { n: "main_hall", d: "dungeon_entrance", s: "guard_hallway" }, interactions: [
        { label: "Search the rubble", action: (r) => { takeItem("Rusty Key"); updateText("You find a heavy Rusty Key buried in the gate rubble."); removeInteraction(r, 0); } }
    ]},

    // Guard Wing (South of Foyer)
    "guard_hallway": { x: 8, y: 17, z: 0, w: 4, h: 2, name: "Guard Hallway", desc: "A wide stone corridor connecting the barracks, mess hall, and armory.", items: [], exits: { n: "foyer", w: "western_armory", e: "barracks", s: "mess_hall" }, interactions: [] },
    
    "barracks": { x: 12, y: 17, z: 0, w: 6, h: 4, name: "Guard Barracks", desc: "Rows of rotted wooden cots line the walls. Smashed footlockers are scattered across the floor.", items: [], exits: { w: "guard_hallway" }, interactions: [
        { label: "Search the footlockers", action: (r) => { takeItem("Guard's Note"); updateText("You pry open a slightly intact footlocker and find a Guard's Note."); removeInteraction(r, 0); } }
    ], features: [
        { type: "bed", x: 1, y: 0.5, w: 1, h: 2 }, { type: "bed", x: 2.5, y: 0.5, w: 1, h: 2 }, { type: "bed", x: 4, y: 0.5, w: 1, h: 2 }
    ]},

    "mess_hall": { x: 8, y: 19, z: 0, w: 4, h: 6, name: "Mess Hall", desc: "A massive dining area for the guards. Long tables are flipped over, and skeletal remains sit in the corners.", items: [], exits: { n: "guard_hallway" }, interactions: [
        { label: "Examine the skeletons", action: (r) => { takeItem("Tomb Key"); updateText("Clutched in the bony fingers of a guard captain is a heavy stone Tomb Key."); removeInteraction(r, 0); } }
    ], features: [
        { type: "table", x: 1, y: 1, w: 2, h: 1 }, { type: "table", x: 1, y: 3, w: 2, h: 1 }
    ]},

    "western_armory": { x: 4, y: 17, z: 0, w: 4, h: 4, name: "Western Armory", desc: "The heavy iron door was securely locked. Inside, racks of halberds and shields line the walls.", items: ["Crowbar"], locked: true, passcode: "8", exits: { e: "guard_hallway" }, interactions: [
        { label: "Search the weapons racks", action: (r) => { updateText("Most of the weapons are rusted to dust, but the Crowbar seems usable."); removeInteraction(r, 0); } }
    ]},

    // Northern Wing (Chapel & Gardens)
    "chapel": { x: 8, y: -2, z: 0, w: 4, h: 6, name: "The Royal Chapel", desc: "Rows of rotting pews face a cracked marble altar. Sunlight streams through a shattered stained-glass window. A heavy door leads North to the Gardens.", items: [], locked: true, passcode: "1472", exits: { s: "courtyard", n: "garden_entrance" }, interactions: [
        { label: "Search the altar", action: (r) => { takeItem("Silver Bell"); updateText("You find a small Silver Bell hidden beneath the altar cloth. It has a strange, geometric base."); removeInteraction(r, 0); } }
    ], features: [
        { type: "altar", x: 1, y: 0.5, w: 2, h: 1 },
        { type: "pews", x: 0.5, y: 2.5, w: 3, h: 3 }
    ]},

    "garden_entrance": { x: 8, y: -6, z: 0, w: 4, h: 4, name: "Garden Gates", desc: "The overgrown entrance to the Royal Gardens. Thorny vines choke the pathways to the West, East, and North.", items: [], exits: { s: "chapel", w: "greenhouse", e: "observatory_path", n: "hedge_1" }, interactions: [] },

    "greenhouse": { x: 2, y: -8, z: 0, w: 6, h: 4, name: "Glass Greenhouse", desc: "A shattered glass dome. Inside, bizarre, unnaturally large plants have taken over. One strange purple flower is dripping sap.", items: [], exits: { e: "garden_entrance" }, interactions: [
        { label: "Collect the purple sap", action: (r) => { takeItem("Nightshade Extract"); updateText("You carefully collect the toxic sap into a vial."); removeInteraction(r, 0); } }
    ], features: [
        { type: "table", x: 1, y: 1, w: 4, h: 2 }
    ]},

    "observatory_path": { x: 12, y: -6, z: 0, w: 4, h: 2, name: "Observatory Path", desc: "A winding dirt path leading to a solitary tower.", items: [], exits: { w: "garden_entrance", e: "observatory" }, interactions: [] },

    "observatory": { x: 16, y: -8, z: 0, w: 4, h: 4, shape: "circle", name: "Star Observatory", desc: "A circular room with a massive brass telescope pointing at the sky.", items: ["Star Map"], exits: { w: "observatory_path" }, interactions: [
        { label: "Look through the telescope", action: (r) => { 
            let code = prompt("You look into the eyepiece. There are three dials to set the coordinates. Enter the 3-digit coordinates (e.g. 123):");
            if (code === "429") {
                updateText("You lock in 4-2-9. The lenses align, focusing on the Serpent constellation. Suddenly, a hidden compartment in the telescope pops open! You found an Ancient Coin.");
                takeItem("Ancient Coin");
                removeInteraction(r, 0);
            } else if (code !== null) {
                updateText("You turn the dials, but all you see is blurry darkness. You need specific coordinates.");
            }
        }}
    ]},

    "hedge_1": { x: 8, y: -10, z: 0, w: 2, h: 4, name: "Hedge Maze - Entrance", desc: "Towering hedges block your vision. The path splits.", items: [], exits: { s: "garden_entrance", n: "hedge_2", e: "hedge_trap" }, interactions: [] },
    "hedge_trap": { x: 10, y: -10, z: 0, w: 2, h: 2, name: "Hedge Maze - Dead End", desc: "A dead end. Wait, the hedges are shifting! You are turned around.", items: [], exits: { s: "garden_entrance" }, interactions: [] },
    "hedge_2": { x: 6, y: -10, z: 0, w: 2, h: 2, name: "Hedge Maze - Fork", desc: "Another fork in the path.", items: [], exits: { e: "hedge_1", n: "hedge_3", w: "hedge_trap" }, interactions: [] },
    "hedge_3": { x: 6, y: -14, z: 0, w: 4, h: 4, name: "Hedge Maze - Center", desc: "You made it to the center of the maze! A stone pedestal stands here.", items: [], exits: { s: "hedge_2" }, interactions: [
        { label: "Examine the pedestal", action: (r) => { takeItem("Astronomer's Log"); updateText("You find an Astronomer's Log resting on the stone."); removeInteraction(r, 0); } }
    ], features: [
        { type: "altar", x: 1.5, y: 1.5, w: 1, h: 1 }
    ]},

    // West Wing
    "west_cloister": { x: 4, y: 6, z: 0, w: 2, h: 4, name: "West Cloister", desc: "A covered walkway surrounding the courtyard. It connects to a circular tower.", items: [], exits: { e: "courtyard", w: "nw_tower_base", s: "dining_room" }, interactions: [] },
    
    "nw_tower_base": { x: 0, y: 6, z: 0, w: 4, h: 4, shape: "circle", name: "NW Watchtower Base", desc: "The base of a massive circular watchtower. A spiral staircase winds upward along the curved wall.", items: ["Torch"], exits: { e: "west_cloister", u: "nw_tower_mid" }, interactions: [] },

    "dining_room": { x: 2, y: 10, z: 0, w: 4, h: 3, name: "Dining Room", desc: "A long mahogany table stretches across this room. A strange, slightly glowing goblet sits at the head of the table.", items: [], exits: { n: "west_cloister", s: "kitchen" }, interactions: [
        { label: "Take the glowing goblet", action: (r) => { takeItem("Enchanted Goblet"); updateText("As you pick it up, the liquid evaporates."); removeInteraction(r, 0); } }
    ], features: [
        { type: "table", x: 0.5, y: 1, w: 3, h: 1 }
    ]},
    
    "kitchen": { x: 2, y: 13, z: 0, w: 4, h: 4, name: "Kitchens", desc: "Giant iron stoves stand cold against the wall. A massive meat cleaver is buried deep into a butcher's block.", items: [], exits: { n: "dining_room", w: "pantry" }, interactions: [
        { label: "Yank the meat cleaver free", action: (r) => { takeItem("Heavy Cleaver"); updateText("You pull the cleaver free."); removeInteraction(r, 0); } }
    ], features: [
        { type: "stove", x: 0, y: 0.5, w: 1, h: 3 },
        { type: "table", x: 2, y: 1.5, w: 1, h: 1 }
    ]},
    
    "pantry": { x: 0, y: 14, z: 0, w: 2, h: 3, name: "Pantry", desc: "It is pitch black in here.", requiresLight: true, items: [], exits: { e: "kitchen" }, interactions: [
        { label: "Search the shelves", action: (r) => { takeItem("Rope"); updateText("You find a coil of sturdy hemp rope."); removeInteraction(r, 0); } }
    ], features: [
        { type: "bookshelf", x: 0, y: 0, w: 0.5, h: 3 }
    ]},

    // East Wing
    "east_cloister": { x: 14, y: 6, z: 0, w: 2, h: 4, name: "East Cloister", desc: "A covered walkway connecting to the library and the eastern tower.", items: [], exits: { w: "courtyard", e: "ne_tower_base", s: "library" }, interactions: [] },
    
    "ne_tower_base": { x: 16, y: 6, z: 0, w: 4, h: 4, shape: "circle", name: "NE Tower Base", desc: "This circular room was used as an armory. A staircase leads up.", items: [], exits: { w: "east_cloister", u: "ne_tower_top" }, interactions: [] },

    "library": { x: 14, y: 10, z: 0, w: 6, h: 5, name: "The Grand Library", desc: "Two stories of rotting books line the walls. A spiral staircase leads up. One bookshelf looks crooked.", items: ["Blue Book", "Red Book"], exits: { n: "east_cloister", s: "study", u: "library_balcony" }, interactions: [
        { label: "Pull the crooked book", action: (r) => {
            updateText("The bookshelf slides right, revealing a hidden passage to the East!");
            world["library"].exits.e = "secret_archive";
            removeInteraction(r, 0);
            updateUI();
        }}
    ], features: [
        { type: "bookshelf", x: 0, y: 0, w: 0.5, h: 4 },
        { type: "bookshelf", x: 5.5, y: 0, w: 0.5, h: 4 },
        { type: "desk", x: 2.5, y: 2, w: 1, h: 1 }
    ]},

    "secret_archive": { x: 20, y: 11, z: 0, w: 3, h: 3, name: "Hidden Archive", desc: "A pristine room untouched by time. A golden chalice sits on a velvet pedestal.", items: ["Golden Book"], exits: { w: "library" }, interactions: [
        { label: "Take the Golden Chalice", action: (r) => { takeItem("Golden Chalice"); player.secretsFound++; updateText("You take the chalice."); removeInteraction(r, 0); } }
    ], features: [
        { type: "altar", x: 1, y: 1, w: 1, h: 1 }
    ]},

    "study": { x: 14, y: 15, z: 0, w: 4, h: 3, name: "Private Study", desc: "A cozy room with a large desk. The fireplace is cold. There is a trapdoor leading down.", items: [], exits: { n: "library", d: "deep_archives" }, interactions: [
        { label: "Search the desk drawers", action: (r) => { takeItem("Brass Key"); takeItem("Lord's Journal"); updateText("You find a Brass Key and a leather-bound journal. Read the journal in your inventory."); removeInteraction(r, 0); }}
    ], features: [
        { type: "desk", x: 1.5, y: 1, w: 1, h: 0.8 },
        { type: "bookshelf", x: 0, y: 0, w: 4, h: 0.5 }
    ]},

    // === LEVEL 1 - SECOND FLOOR ===
    "nw_tower_mid": { x: 0, y: 6, z: 1, w: 4, h: 4, shape: "circle", name: "NW Watchtower Mid", desc: "A circular landing in the watchtower. The stairs continue up.", items: [], exits: { d: "nw_tower_base", u: "nw_tower_top" }, interactions: [] },
    "nw_tower_top": { x: 0, y: 6, z: 2, w: 4, h: 4, shape: "circle", name: "NW Watchtower Peak", desc: "You are at the very top of the tower. You can see for miles across the ash-covered landscape.", items: [], exits: { d: "nw_tower_mid" }, interactions: [] },

    "ne_tower_top": { x: 16, y: 6, z: 1, w: 4, h: 4, shape: "circle", name: "NE Tower Peak", desc: "The top of the eastern tower. A skeleton slumped against the wall holds a vial.", items: ["Healing Potion"], exits: { d: "ne_tower_base" }, interactions: [] },

    "library_balcony": { x: 14, y: 10, z: 1, w: 6, h: 5, name: "Library Balcony", desc: "You are on the wooden walkway overlooking the library.", items: [], exits: { d: "library", w: "upper_hall" }, interactions: [] },
    
    "upper_hall": { x: 8, y: 10, z: 1, w: 4, h: 4, name: "Upper Hallway", desc: "A long gallery lined with exactly 8 empty suits of armor. A grand staircase leads UP.", items: [], exits: { e: "library_balcony", s: "master_bedroom", u: "sphinx_landing" }, interactions: [] },
    
    "master_bedroom": { x: 8, y: 14, z: 1, w: 4, h: 4, name: "Master Bedroom", desc: "A lavish but ruined bedroom. The four-poster bed has collapsed.", locked: true, requiredKey: "Brass Key", items: [], exits: { n: "upper_hall" }, interactions: [
        { label: "Search beneath the floorboards", action: (r) => {
            if (player.inventory.includes("Heavy Cleaver") || player.inventory.includes("Crowbar")) {
                takeItem("Crown Jewel (Secret)");
                player.secretsFound++;
                updateText("Using your heavy tools, you pry open the loose floorboards, uncovering the legendary Crown Jewel!");
                removeInteraction(r, 0);
            } else {
                updateText("You notice a loose floorboard, but it's jammed tight. You need a tool to pry it open.");
            }
        }}
    ], features: [
        { type: "bed", x: 1, y: 1, w: 2, h: 2.5 }
    ]},

    // === LEVEL 2 - HIGH KEEP ===
    "sphinx_landing": { x: 8, y: 10, z: 2, w: 4, h: 4, name: "The Sphinx Landing", desc: "A massive, magical stone Sphinx blocks the golden doors to the North.", items: [], exits: { d: "upper_hall" }, interactions: [
        { label: "Speak to the Sphinx", action: (r) => {
            let ans = prompt("The Sphinx speaks: 'What runs but never walks, has a mouth but never talks?'");
            if (ans && ans.toLowerCase().includes("river")) {
                updateText("The Sphinx bows its head. 'You may pass.' The golden doors swing open!");
                world["sphinx_landing"].exits.n = "throne_room";
                removeInteraction(r, 0);
                updateUI();
            } else if (ans !== null) {
                updateText("The Sphinx's eyes flash red. 'Incorrect. Begone.'");
            }
        }}
    ]},
    "throne_room": { x: 8, y: 4, z: 2, w: 4, h: 6, name: "The Dark Throne", desc: "You have reached the apex of the citadel. A massive obsidian throne sits empty.", items: [], exits: { s: "sphinx_landing" }, interactions: [
        { label: "Sit on the Throne", action: (r) => { updateText("You sit on the throne. The castle trembles. You have conquered the Citadel!"); removeInteraction(r, 0); } }
    ], features: [
        { type: "altar", x: 1, y: 1, w: 2, h: 2 }
    ]},

    // === LEVEL -1 - DUNGEON & DEEP ARCHIVES ===
    "dungeon_entrance": { x: 8, y: 14, z: -1, w: 4, h: 3, name: "Dungeon Entrance", desc: "The air here is freezing cold. The walls are rough-hewn stone.", requiresLight: true, items: [], exits: { u: "foyer", n: "cell_block" }, interactions: [] },
    
    "cell_block": { x: 6, y: 8, z: -1, w: 8, h: 6, name: "Central Cell Block", desc: "A massive block of iron cages.", requiresLight: true, locked: true, requiredKey: "Rusty Key", items: [], exits: { s: "dungeon_entrance", w: "torture_chamber", e: "oubliette_top" }, interactions: [
        { label: "Search the skeletons", action: (r) => { takeItem("Iron Ring"); updateText("You find a heavy iron ring."); removeInteraction(r, 0); }}
    ]},

    "torture_chamber": { x: 2, y: 8, z: -1, w: 4, h: 6, name: "Torture Chamber", desc: "Rusted terrifying implements fill this room. An iron maiden stands open.", requiresLight: true, items: [], exits: { e: "cell_block" }, interactions: [
        { label: "Look inside the Iron Maiden", action: (r) => { takeItem("Ancient Coin"); updateText("You find an ancient gold coin."); removeInteraction(r, 0); }}
    ]},

    "oubliette_top": { x: 14, y: 10, z: -1, w: 2, h: 2, name: "Oubliette Grate", desc: "A heavy iron grate covers a pitch-black hole.", requiresLight: true, items: [], exits: { w: "cell_block" }, interactions: [
        { label: "Tie Rope and climb down [Requires Rope]", action: (r) => {
            if (player.inventory.includes("Rope")) {
                world["oubliette_top"].exits.d = "oubliette_bottom";
                updateText("You securely tie the rope to the iron grate and drop it into the abyss. You can now climb down.");
                removeInteraction(r, 0);
                updateUI();
            } else {
                updateText("It's a sheer drop into darkness. You need a Rope.");
            }
        }}
    ]},

    "deep_archives": { x: 14, y: 15, z: -1, w: 6, h: 6, name: "The Deep Archives", desc: "A forgotten library beneath the study. A stone pedestal sits before a sealed vault door.", requiresLight: true, items: [], exits: { u: "study" }, interactions: [
        { label: "Place the Red, Blue, and Gold Books on the pedestal", action: (r) => {
            if (player.inventory.includes("Red Book") && player.inventory.includes("Blue Book") && player.inventory.includes("Golden Book")) {
                world["deep_archives"].exits.e = "forbidden_vault";
                updateText("You place the three colored books onto the pedestal. The heavy vault door slides open!");
                removeInteraction(r, 0);
                updateUI();
            } else {
                updateText("You are missing some of the books required to complete the pedestal array.");
            }
        }}
    ], features: [
        { type: "bookshelf", x: 0, y: 0, w: 6, h: 0.5 }, { type: "altar", x: 2.5, y: 2.5, w: 1, h: 1 }
    ]},

    "forbidden_vault": { x: 20, y: 15, z: -1, w: 4, h: 4, name: "Forbidden Vault", desc: "The air here crackles with dark magic.", requiresLight: true, items: [], exits: { w: "deep_archives" }, interactions: [
        { label: "Take the Cursed Relic", action: (r) => { updateText("As you touch it, voices whisper in your mind. You have found a horrifying secret."); player.secretsFound++; removeInteraction(r, 0); }}
    ]},

    // === LEVEL -2 - DEEP DUNGEON & CRYPTS ===
    "oubliette_bottom": { x: 14, y: 10, z: -2, w: 2, h: 2, name: "The Oubliette", desc: "It is suffocatingly tight down here. You are standing on ancient bones. A narrow fissure leads South.", requiresLight: true, items: [], exits: { u: "oubliette_top", s: "crypt_entrance" }, interactions: [] },
    
    "crypt_entrance": { x: 12, y: 12, z: -2, w: 6, h: 4, name: "Crypt of the Forgotten", desc: "A sprawling underground catacomb. Stone sarcophagi line the walls.", requiresLight: true, items: [], exits: { n: "oubliette_bottom", e: "tomb_of_kings" }, interactions: [] },

    "tomb_of_kings": { x: 18, y: 12, z: -2, w: 6, h: 6, name: "Tomb of the First King", desc: "A majestic underground tomb. A massive stone door blocks the center.", requiresLight: true, locked: true, requiredKey: "Tomb Key", items: [], exits: { w: "crypt_entrance" }, interactions: [
        { label: "Open the Sarcophagus", action: (r) => { 
            takeItem("King's Crown (Secret)");
            player.secretsFound++;
            updateText("You heave the heavy stone lid open, revealing the King's Crown!");
            removeInteraction(r, 0);
        }}
    ], features: [
        { type: "altar", x: 2, y: 2, w: 2, h: 2 }
    ]}
};

// --- PLAYER STATE ---
let player = {
    currentRoom: "courtyard",
    inventory: [],
    discoveredRooms: ["courtyard"],
    secretsFound: 0
};

let currentMessage = null;

const savedState = localStorage.getItem('citadel_rpg_state_v10');
if (savedState) {
    player = JSON.parse(savedState);
} else {
    localStorage.clear();
}

function saveGame() {
    localStorage.setItem('citadel_rpg_state_v10', JSON.stringify(player));
    updateUI();
}

function takeItem(item) {
    if (!player.inventory.includes(item)) player.inventory.push(item);
}
function updateText(text) {
    currentMessage = text;
    document.getElementById('story-text').innerText = text;
}
function removeInteraction(room, index) {
    room.interactions.splice(index, 1);
}

// --- ENGINE LOGIC ---
function updateUI() {
    const room = world[player.currentRoom];
    
    document.getElementById('room-name').innerText = room.name;

    if (room.requiresLight && !player.inventory.includes("Torch")) {
        document.getElementById('story-text').innerText = "It is pitch black in here. You cannot see anything. You need a light source.";
        document.getElementById('choices-container').innerHTML = '';
    } else {
        document.getElementById('story-text').innerText = currentMessage || room.desc;
        renderActions(room);
    }
    
    document.getElementById('rooms-count').innerText = player.discoveredRooms.length;
    document.getElementById('secrets-count').innerText = player.secretsFound;

    const invList = document.getElementById('inventory-list');
    invList.innerHTML = '';
    if (player.inventory.length === 0) {
        invList.innerHTML = '<li class="empty-inv">Empty</li>';
    } else {
        player.inventory.forEach(item => {
            let li = document.createElement('li');
            li.innerText = item;
            li.onclick = () => showItemDescription(item);
            invList.appendChild(li);
        });
    }

    renderNavigation(room);
}

function showItemDescription(itemName) {
    const box = document.getElementById('item-description-box');
    const nameEl = document.getElementById('item-desc-name');
    const textEl = document.getElementById('item-desc-text');
    
    let baseName = itemName.replace(" (Secret)", "");
    let desc = itemsDB[baseName] || "A mysterious object.";
    
    nameEl.innerText = itemName;
    textEl.innerText = desc;
    box.classList.remove('hidden');
}

function renderActions(room) {
    const container = document.getElementById('choices-container');
    container.innerHTML = '';

    if (room.items.length > 0) {
        room.items.forEach(item => {
            const takeBtn = document.createElement('button');
            takeBtn.className = 'choice-btn';
            takeBtn.innerText = `Take [${item}]`;
            takeBtn.onclick = () => {
                player.inventory.push(item);
                if (item.includes("(Secret)")) player.secretsFound++;
                room.items = room.items.filter(i => i !== item);
                updateText(`You took the ${item}.`);
                renderActions(room);
                saveGame();
            };
            container.appendChild(takeBtn);
        });
    }

    if (room.interactions && room.interactions.length > 0) {
        room.interactions.forEach((int, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerText = int.label;
            btn.onclick = () => {
                int.action(room);
                renderActions(room);
                saveGame();
            };
            container.appendChild(btn);
        });
    } else if (room.items.length === 0) {
        const p = document.createElement('p');
        p.style.color = '#55627a';
        p.style.fontStyle = 'italic';
        p.innerText = "There is nothing else to interact with here.";
        container.appendChild(p);
    }
}

function renderNavigation(room) {
    const container = document.getElementById('navigation-container');
    container.innerHTML = '';
    const dirs = { n: "North", s: "South", e: "East", w: "West", u: "Up", d: "Down" };

    for (let dir in room.exits) {
        const targetId = room.exits[dir];
        const targetRoom = world[targetId];
        
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        
        let label = `Go ${dirs[dir]}`;
        if (player.discoveredRooms.includes(targetId)) {
            label += ` (To ${targetRoom.name})`;
        } else {
            label += ` (Unexplored)`;
        }

        if (targetRoom.locked) {
            if (targetRoom.passcode) {
                btn.innerText = `Enter Passcode to go ${dirs[dir]}`;
                btn.onclick = () => {
                    let code = prompt("The door is sealed with a combination lock. Enter the code:");
                    if (code === targetRoom.passcode) {
                        targetRoom.locked = false;
                        updateText(`Click. The heavy door swings open.`);
                        saveGame();
                    } else if (code !== null) {
                        updateText("The code was incorrect. The door remains sealed.");
                        saveGame();
                    }
                };
            } else {
                label += ` [Requires ${targetRoom.requiredKey}]`;
                if (player.inventory.includes(targetRoom.requiredKey)) {
                    btn.innerText = `Unlock door to ${dirs[dir]} with ${targetRoom.requiredKey}`;
                    btn.onclick = () => {
                        targetRoom.locked = false;
                        updateText(`You unlocked the path using the ${targetRoom.requiredKey}.`);
                        saveGame();
                    };
                } else {
                    btn.innerText = label;
                    btn.disabled = true;
                }
            }
        } else {
            btn.innerText = label;
            btn.onclick = () => {
                player.currentRoom = targetId;
                if (!player.discoveredRooms.includes(targetId)) {
                    player.discoveredRooms.push(targetId);
                }
                currentMessage = null; 
                document.getElementById('item-description-box').classList.add('hidden'); 
                saveGame();
            };
        }
        container.appendChild(btn);
    }
}

// --- MAP LOGIC (ARCHITECTURAL PAN/ZOOM) ---
let currentMapZ = 0;
let isDragging = false;
let startX, startY;
let currentX = 0, currentY = 0;
let scale = 1.2;
const UNIT = 40; 

function toggleMap() {
    const modal = document.getElementById('map-modal');
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        currentMapZ = world[player.currentRoom].z;
        renderMapTabs();
        renderFloorplan();
        scale = 1.2;
        centerMapOnPlayer();
    } else {
        modal.classList.add('hidden');
    }
}

function centerMapOnPlayer() {
    const room = world[player.currentRoom];
    if (room.z === currentMapZ) {
        const viewport = document.getElementById('map-viewport');
        const vW = viewport.clientWidth;
        const vH = viewport.clientHeight;

        let centerX = (room.x * UNIT) + ((room.w * UNIT) / 2);
        let centerY = (room.y * UNIT) + ((room.h * UNIT) / 2);
        
        currentX = (vW / 2) - (centerX * scale);
        currentY = (vH / 2) - (centerY * scale);
        updateMapPosition();
    }
}

function renderMapTabs() {
    const tabsContainer = document.getElementById('level-tabs');
    tabsContainer.innerHTML = '';
    
    let discoveredZ = new Set();
    player.discoveredRooms.forEach(id => discoveredZ.add(world[id].z));
    let zArray = Array.from(discoveredZ).sort((a,b) => b - a);
    
    zArray.forEach(z => {
        let name = z === 0 ? "Ground Floor" : (z > 0 ? `Floor ${z+1}` : `Basement ${Math.abs(z)}`);
        const btn = document.createElement('button');
        btn.className = `level-tab ${z === currentMapZ ? 'active' : ''}`;
        btn.innerText = name;
        btn.onclick = () => {
            currentMapZ = z;
            renderMapTabs();
            renderFloorplan();
            scale = 1.2;
            centerMapOnPlayer();
        };
        tabsContainer.appendChild(btn);
    });
}

function renderFloorplan() {
    const plane = document.getElementById('map-plane');
    plane.innerHTML = '';

    let roomsToRender = new Set();
    for (let id in world) {
        const room = world[id];
        if (room.z === currentMapZ) {
            if (player.discoveredRooms.includes(id)) {
                roomsToRender.add(id);
                for (let dir in room.exits) {
                    let adjId = room.exits[dir];
                    if (world[adjId] && world[adjId].z === currentMapZ) {
                        roomsToRender.add(adjId);
                    }
                }
            }
        }
    }

    roomsToRender.forEach(id => {
        const room = world[id];
        const isDiscovered = player.discoveredRooms.includes(id);
        const isCurrent = (id === player.currentRoom);

        const el = document.createElement('div');
        el.className = 'map-room';
        if (room.shape) el.classList.add(`shape-${room.shape}`);
        
        el.style.left = `${room.x * UNIT}px`;
        el.style.top = `${room.y * UNIT}px`;
        el.style.width = `${room.w * UNIT}px`;
        el.style.height = `${room.h * UNIT}px`;

        if (isDiscovered) el.classList.add('discovered');
        if (isCurrent) el.classList.add('current');
        
        if (isDiscovered) {
            el.innerHTML = `<div class="room-title">${room.name}</div>`;
            
            if (room.features) {
                room.features.forEach(feat => {
                    const fEl = document.createElement('div');
                    fEl.className = `map-feature feature-${feat.type}`;
                    fEl.style.left = `${feat.x * UNIT}px`;
                    fEl.style.top = `${feat.y * UNIT}px`;
                    fEl.style.width = `${feat.w * UNIT}px`;
                    fEl.style.height = `${feat.h * UNIT}px`;
                    el.appendChild(fEl);
                });
            }
            
            if (!room.shape) {
                for (let dir in room.exits) {
                    let adjId = room.exits[dir];
                    if (world[adjId] && world[adjId].z === room.z) {
                        const door = document.createElement('div');
                        door.className = `map-door door-${dir}`;
                        el.appendChild(door);
                    }
                }
            }
        }
        plane.appendChild(el);
    });
}

function updateMapPosition() {
    document.getElementById('map-plane').style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
}

const viewport = document.getElementById('map-viewport');
if (viewport) {
    viewport.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
    });
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        currentX = e.clientX - startX;
        currentY = e.clientY - startY;
        updateMapPosition();
    });
    window.addEventListener('mouseup', () => isDragging = false);
    window.addEventListener('mouseleave', () => isDragging = false);

    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomIntensity = 0.1;
        const wheel = e.deltaY < 0 ? 1 : -1;
        const zoom = Math.exp(wheel * zoomIntensity);
        
        const newScale = Math.min(Math.max(0.3, scale * zoom), 3);
        
        const rect = viewport.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        currentX = mouseX - (mouseX - currentX) * (newScale / scale);
        currentY = mouseY - (mouseY - currentY) * (newScale / scale);
        
        scale = newScale;
        updateMapPosition();
    });
}

window.onload = () => {
    updateUI();
};
