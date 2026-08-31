const world = {
    "entrance": {
        name: "The Obsidian Gates",
        desc: "You stand before the colossal iron doors of the Blackwood Citadel. The air is cold and smells of ozone.",
        x: 0, y: 0, w: 6, h: 4, z: 0,
        exits: { n: "grand_hall", w: "guard_house" },
        items: [{ id: "brass_key", name: "Brass Key", desc: "A heavy, ornate key with a wolf's head insignia." }]
    },
    "guard_house": {
        name: "Guardhouse",
        desc: "A small, dilapidated room littered with rusted armor. A skeleton slumps over a dusty table.",
        x: -4, y: 0, w: 4, h: 3, z: 0,
        exits: { e: "entrance" },
        features: [
            { type: "table", x: 1, y: 1, w: 2, h: 1 },
            { type: "bed", x: 0.5, y: 0.5, w: 1, h: 2 }
        ],
        items: [{ id: "tinderbox", name: "Tinderbox", desc: "Flint and steel. Still functional." }]
    },
    "grand_hall": {
        name: "The Grand Hall",
        desc: "A cavernous room supported by fluted pillars. A massive chandelier has crashed into the center of the floor.",
        x: -2, y: -6, w: 10, h: 6, z: 0,
        locked: true, requiredKey: "Brass Key",
        exits: { s: "entrance", w: "dining_hall", e: "library", n: "stairwell_up" },
        features: [
            { type: "carpet", x: 3, y: 0, w: 4, h: 6 }
        ]
    },
    "dining_hall": {
        name: "Dining Hall",
        desc: "A long table stretches across the room, set with rotting food. The fireplace is cold.",
        x: -8, y: -6, w: 6, h: 5, z: 0,
        exits: { e: "grand_hall", s: "kitchen" },
        features: [
            { type: "table", x: 1, y: 1, w: 4, h: 3 }
        ]
    },
    "kitchen": {
        name: "Servant's Kitchen",
        desc: "Iron stoves and copper pots lie in disarray. There is a faint smell of dried blood.",
        x: -8, y: -1, w: 4, h: 4, z: 0,
        exits: { n: "dining_hall", d: "wine_cellar" },
        features: [
            { type: "stove", x: 0, y: 1, w: 1, h: 2 },
            { type: "table", x: 2, y: 1, w: 1, h: 2 }
        ]
    },
    "library": {
        name: "The Scholar's Atrium",
        desc: "Thousands of books line the walls. Many have fallen to the floor. There is a locked door to the east with a strange mechanism.",
        x: 8, y: -6, w: 5, h: 7, z: 0,
        exits: { w: "grand_hall", e: "secret_study" },
        features: [
            { type: "bookshelf", x: 0, y: 0, w: 5, h: 1 },
            { type: "bookshelf", x: 0, y: 6, w: 5, h: 1 },
            { type: "desk", x: 2, y: 3, w: 2, h: 1 }
        ]
    },
    "secret_study": {
        name: "Hidden Study",
        desc: "A cramped, windowless room. The walls are covered in frantic charcoal drawings of a shifting maze.",
        x: 13, y: -4, w: 3, h: 3, z: 0,
        locked: true, passcode: "492",
        exits: { w: "library", d: "deep_archives" },
        features: [
            { type: "desk", x: 0.5, y: 0.5, w: 2, h: 1 }
        ],
        items: [{ id: "moon_medallion", name: "Moon Medallion", desc: "A silver disk cold to the touch. Needed to access the Royal Gardens." }]
    },
    
    // BASEMENT (z = -1)
    "wine_cellar": {
        name: "Wine Cellar",
        desc: "Damp and claustrophobic. Massive oak casks line the walls. A passageway leads deeper into the earth.",
        x: -8, y: -1, w: 6, h: 5, z: -1,
        exits: { u: "kitchen", e: "crypt" }
    },
    "crypt": {
        name: "Family Crypt",
        desc: "Stone sarcophagi sit in solemn silence. The air is deathly still.",
        x: -2, y: 0, w: 6, h: 5, z: -1,
        exits: { w: "wine_cellar", e: "deep_archives" }
    },
    "deep_archives": {
        name: "Deep Archives",
        desc: "Rows of ancient scrolls, mostly reduced to dust. A spiral staircase goes up.",
        x: 12, y: -4, w: 5, h: 5, z: -1,
        exits: { w: "crypt", u: "secret_study" }
    },

    // SECOND FLOOR (z = 1)
    "stairwell_up": {
        name: "Grand Staircase",
        desc: "A sweeping marble staircase ascending to the second floor. A stained glass window depicts a wolf howling at the moon.",
        x: -2, y: -10, w: 4, h: 4, z: 0,
        exits: { s: "grand_hall", u: "upper_landing" }
    },
    "upper_landing": {
        name: "Upper Landing",
        desc: "You are on the second floor. Corridors branch left and right. Ahead is a heavy oak door.",
        x: -2, y: -10, w: 4, h: 4, z: 1,
        exits: { d: "stairwell_up", w: "servants_quarters", e: "royal_gardens", n: "throne_room" }
    },
    "servants_quarters": {
        name: "Servants Quarters",
        desc: "Rows of narrow beds. The ceiling has caved in on the far side.",
        x: -8, y: -10, w: 6, h: 4, z: 1,
        exits: { e: "upper_landing" },
        features: [
            { type: "bed", x: 1, y: 0, w: 1, h: 2 },
            { type: "bed", x: 3, y: 0, w: 1, h: 2 },
            { type: "bed", x: 5, y: 0, w: 1, h: 2 }
        ],
        items: [{ id: "rope", name: "Coil of Rope", desc: "Sturdy hemp rope." }]
    },
    "royal_gardens": {
        name: "Glasshouse Gardens",
        desc: "An indoor arboretum. The glass roof is shattered, letting in pale moonlight. Overgrown vines choke the pathways.",
        x: 2, y: -14, w: 8, h: 8, z: 1,
        locked: true, requiredKey: "Moon Medallion",
        exits: { w: "upper_landing", n: "observatory" },
        features: [
            { type: "fountain", x: 3, y: 3, w: 2, h: 2 }
        ]
    },
    "observatory": {
        name: "The Observatory",
        desc: "A massive brass telescope points towards the sky. Star charts cover every surface.",
        x: 4, y: -19, w: 4, h: 5, z: 1,
        shape: 'circle',
        exits: { s: "royal_gardens" }
    },
    "throne_room": {
        name: "The Obsidian Throne",
        desc: "A majestic hall. A throne carved from a single piece of black glass sits at the far end. There is a locked door behind it.",
        x: -3, y: -18, w: 6, h: 8, z: 1,
        exits: { s: "upper_landing", n: "high_keep" },
        features: [
            { type: "carpet", x: 2, y: 1, w: 2, h: 6 },
            { type: "altar", x: 2.5, y: 0.5, w: 1, h: 1 }
        ]
    },

    // TOWER (z = 2)
    "high_keep": {
        name: "The High Keep",
        desc: "You have reached the highest tower. The wind howls through the arrow slits. You feel you are near the end of your journey.",
        x: -2, y: -22, w: 4, h: 4, z: 2,
        locked: true, passcode: "STARS",
        exits: { s: "throne_room" }
    }
};

let player = {
    currentRoom: "entrance",
    inventory: [],
    discoveredRooms: ["entrance"]
};

let currentMessage = null;

function saveGame() {
    localStorage.setItem('citadelSave', JSON.stringify(player));
    updateUI();
}

function loadGame() {
    const saved = localStorage.getItem('citadelSave');
    if (saved) {
        player = JSON.parse(saved);
        updateUI();
    }
}

function updateText(text) {
    currentMessage = text;
    updateUI();
}

function updateUI() {
    const room = world[player.currentRoom];
    document.getElementById('room-name').innerText = room.name;
    
    if (currentMessage) {
        document.getElementById('story-text').innerHTML = `<p>${room.desc}</p><p style="color:#4ade80; border-left: 2px solid #4ade80; padding-left: 10px;">${currentMessage}</p>`;
    } else {
        document.getElementById('story-text').innerText = room.desc;
    }

    renderActions(room);
    renderNavigation(room);
    renderInventory();
    
    document.getElementById('rooms-count').innerText = player.discoveredRooms.length;
    let secrets = player.inventory.length;
    document.getElementById('secrets-count').innerText = secrets;
}

function renderInventory() {
    const list = document.getElementById('inventory-list');
    list.innerHTML = '';
    if (player.inventory.length === 0) {
        list.innerHTML = '<li class="empty-inv">Empty</li>';
    } else {
        player.inventory.forEach(itemId => {
            const li = document.createElement('li');
            li.innerText = itemId; 
            
            li.onclick = () => {
                const descBox = document.getElementById('item-description-box');
                const nameEl = document.getElementById('item-desc-name');
                const textEl = document.getElementById('item-desc-text');
                
                descBox.classList.remove('hidden');
                
                let foundItem = null;
                for (let r in world) {
                    if (world[r].items) {
                        let i = world[r].items.find(it => it.name === itemId);
                        if (i) foundItem = i;
                    }
                }
                
                if (foundItem) {
                    nameEl.innerText = foundItem.name;
                    textEl.innerText = foundItem.desc;
                } else {
                    nameEl.innerText = itemId;
                    textEl.innerText = "A mysterious artifact.";
                }
            };
            list.appendChild(li);
        });
    }
}

function renderActions(room) {
    const container = document.getElementById('choices-container');
    container.innerHTML = '';

    if (room.items && room.items.length > 0) {
        room.items.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerText = `Take ${item.name}`;
            btn.onclick = () => {
                player.inventory.push(item.name);
                room.items = room.items.filter(i => i.id !== item.id);
                updateText(`You picked up the ${item.name}.`);
                document.getElementById('item-description-box').classList.add('hidden');
                saveGame();
            };
            container.appendChild(btn);
        });
    }

    if (room.name === "The Scholar's Atrium") {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerText = "Read a Dusty Tome";
        btn.onclick = () => {
            updateText("You pull a crumbling book from the shelf. 'The Master of the Keep looks to the Heavens. The answer lies in the STARS.'");
            saveGame();
        };
        container.appendChild(btn);
    }
    
    if (room.name === "Hidden Study") {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerText = "Examine Drawings";
        btn.onclick = () => {
            updateText("The drawings seem to map out the castle. One note reads: 'The lowest point holds the truth.'");
            saveGame();
        };
        container.appendChild(btn);
    }

    if (container.children.length === 0) {
        container.innerHTML = '<span style="color:#5c544a; font-style:italic;">Nothing obvious to interact with.</span>';
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