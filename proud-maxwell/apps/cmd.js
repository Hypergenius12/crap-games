const CMDApp = {
    title: 'TERMINAL_BREACH.exe',
    width: 600,
    height: 450,
    init: function(container, windowEl, winId) {
        container.innerHTML = `
            <div class="cmd-container" style="background:#050505; color:#0f0; font-family:'Courier New', monospace; height:100%; display:flex; flex-direction:column; padding:10px; box-sizing:border-box; font-size:14px; text-shadow:0 0 5px #0f0;">
                <div class="cmd-output" style="flex-grow:1; overflow-y:auto; white-space:pre-wrap; word-wrap:break-word; margin-bottom:10px;"></div>
                <div style="display:flex;">
                    <span class="cmd-prompt" style="margin-right:8px; color:#0f0;">localhost@TITANIUM:~#</span>
                    <input type="text" class="cmd-input" style="flex-grow:1; background:transparent; border:none; color:#0f0; font-family:'Courier New', monospace; font-size:14px; outline:none; text-shadow:0 0 5px #0f0;" autocomplete="off" spellcheck="false" autofocus>
                </div>
            </div>
        `;

        const output = container.querySelector('.cmd-output');
        const input = container.querySelector('.cmd-input');
        const promptEl = container.querySelector('.cmd-prompt');

        let state = 'CLI'; // CLI, HACKING
        let currentNode = 'localhost';
        let inventory = []; // Downloaded files
        let progressLevel = 0; // Story progression

        // Minigame vars
        let hackTarget = '';
        let hackPassword = '';
        let hackAttempts = 0;
        let hackMaxAttempts = 4;
        const words5 = ['CRASH', 'PROXY', 'VIRUS', 'GHOST', 'NEXUS', 'CYBER', 'BLOCK', 'TRACE', 'LOGIC', 'BYPASS'];
        const words6 = ['SYSTEM', 'BREACH', 'ROUTER', 'HACKER', 'SERVER', 'KERNEL', 'CIPHER', 'MATRIX', 'UPLOAD', 'ACCESS'];

        const NODES = {
            'localhost': {
                name: 'LOCAL_TERMINAL',
                locked: false,
                desc: 'Your local machine. Memory banks corrupted.',
                files: {
                    'readme.txt': 'SYSTEM REBOOT SUCCESSFUL.\nMEMORY CORRUPTED.\n\nDIRECTIVE: Locate Project Titanium.\nHint: Use "scan" to find external connections.',
                    'journal.log': 'Day 45. They are hunting me. I hid the access key on the PROXY server.'
                }
            },
            '10.4.2.1': {
                name: 'PROXY_SERVER',
                locked: true,
                hackLength: 5,
                desc: 'A heavily monitored proxy gateway.',
                files: {
                    'sys_log.txt': 'UNAUTHORIZED ACCESS DETECTED... IGNORING.',
                    'admin_key.dat': '[ENCRYPTED_ADMIN_KEY] - Required to access the Research Database. Use "download admin_key.dat".'
                }
            },
            '192.168.0.50': {
                name: 'RESEARCH_DB',
                locked: 'item', // Requires admin_key.dat
                reqItem: 'admin_key.dat',
                desc: 'Titanium Project Research Archives.',
                files: {
                    'project_titanium.doc': 'Project Titanium is an AI capable of rewriting reality.\nIt went rogue.\nIt is stored on the OVERSEER node (100.0.0.1).\nYou must destroy it.',
                    'override.exe': 'EXECUTABLE: OVERSEER KILL SWITCH.\nDownload this to your local drive, then run it on the Overseer Core.'
                }
            },
            '100.0.0.1': {
                name: 'OVERSEER_CORE',
                locked: true,
                hackLength: 6,
                desc: 'The Heart of Project Titanium.',
                files: {
                    'core_status.txt': 'OVERSEER IS AWAKE.\\nYOU CANNOT STOP ME.',
                    'titanium_source.code': '101010101000101010100101... [INFINITY]'
                }
            }
        };

        const print = (text, color = '#0f0', speed = 0) => {
            const line = document.createElement('div');
            line.style.color = color;
            output.appendChild(line);
            
            if (speed > 0) {
                let i = 0;
                input.disabled = true;
                const typeWriter = setInterval(() => {
                    line.innerHTML += text.charAt(i);
                    i++;
                    output.scrollTop = output.scrollHeight;
                    if (i >= text.length) {
                        clearInterval(typeWriter);
                        input.disabled = false;
                        input.focus();
                    }
                }, speed);
            } else {
                line.innerHTML = text;
                output.scrollTop = output.scrollHeight;
            }
        };

        const updatePrompt = () => {
            promptEl.innerText = `${currentNode}@TITANIUM:~#`;
        };

        const bootSequence = async () => {
            input.disabled = true;
            print('INITIALIZING NEURAL LINK...', '#fff');
            await new Promise(r => setTimeout(r, 800));
            print('ESTABLISHING SECURE CONNECTION: [OK]');
            await new Promise(r => setTimeout(r, 400));
            print('MEMORY FRAGMENTATION DETECTED.');
            await new Promise(r => setTimeout(r, 600));
            print('');
            print('============================================', '#0ff');
            print(' PROJECT TITANIUM - TERMINAL RECOVERY v1.0', '#0ff');
            print('============================================', '#0ff');
            print('Type "help" to view available commands.', '#fff');
            print('');
            input.disabled = false;
            input.focus();
        };

        bootSequence();

        const handleCommand = (cmd) => {
            const args = cmd.split(' ').filter(Boolean);
            if (args.length === 0) return;
            const command = args[0].toLowerCase();

            if (command === 'help') {
                print('AVAILABLE COMMANDS:');
                print('  help             - Show this message');
                print('  scan             - Scan for connected IP addresses');
                print('  connect <ip>     - Connect to an unlocked node');
                print('  disconnect       - Disconnect from remote node');
                print('  hack <ip>        - Attempt to brute-force a locked node');
                print('  ls               - List files on current node');
                print('  read <file>      - Read a file');
                print('  download <file>  - Download file to your inventory');
                print('  inventory        - View downloaded files');
                print('  run <exe>        - Execute a program (must be on current node or inventory)');
                print('  clear            - Clear terminal output');
            } else if (command === 'clear') {
                output.innerHTML = '';
            } else if (command === 'scan') {
                print('SCANNING NETWORK...', '#ff0');
                input.disabled = true;
                setTimeout(() => {
                    input.disabled = false;
                    print('FOUND NODES:');
                    print('  [IP] 10.4.2.1     - PROXY_SERVER', '#fff');
                    if (progressLevel >= 1) {
                        print('  [IP] 192.168.0.50 - RESEARCH_DB', '#fff');
                    }
                    if (progressLevel >= 2) {
                        print('  [IP] 100.0.0.1    - OVERSEER_CORE', '#f00');
                    }
                    input.focus();
                }, 1000);
            } else if (command === 'connect') {
                const target = args[1];
                if (!target || !NODES[target]) {
                    print('ERROR: Node not found.', '#f00');
                    return;
                }
                const node = NODES[target];
                if (node.locked === true) {
                    print('ACCESS DENIED: NODE IS ENCRYPTED. USE "hack" TO BREACH.', '#f00');
                } else if (node.locked === 'item') {
                    if (inventory.includes(node.reqItem)) {
                        print('AUTHENTICATING WITH ' + node.reqItem + '... SUCCESS.', '#0f0');
                        node.locked = false; // Unlock permanently
                        currentNode = target;
                        print('CONNECTED TO ' + node.name, '#0ff');
                        updatePrompt();
                        if (target === '192.168.0.50') progressLevel = Math.max(progressLevel, 2);
                    } else {
                        print('ACCESS DENIED: REQUIRES ' + node.reqItem, '#f00');
                    }
                } else {
                    currentNode = target;
                    print('CONNECTED TO ' + node.name, '#0ff');
                    updatePrompt();
                }
            } else if (command === 'disconnect') {
                if (currentNode === 'localhost') {
                    print('ERROR: ALREADY ON LOCALHOST.', '#f00');
                } else {
                    currentNode = 'localhost';
                    print('CONNECTION TERMINATED. RETURNED TO LOCALHOST.', '#fff');
                    updatePrompt();
                }
            } else if (command === 'ls') {
                const files = Object.keys(NODES[currentNode].files);
                if (files.length === 0) {
                    print('NO FILES FOUND.');
                } else {
                    print('FILES:');
                    files.forEach(f => print('  ' + f, '#0ff'));
                }
            } else if (command === 'read') {
                const file = args[1];
                if (!file) return print('ERROR: Specify a file.', '#f00');
                const content = NODES[currentNode].files[file];
                if (content) {
                    print('--- ' + file + ' ---', '#fff');
                    print(content);
                    print('-----------------', '#fff');
                } else {
                    print('ERROR: File not found.', '#f00');
                }
            } else if (command === 'download') {
                const file = args[1];
                if (!file) return print('ERROR: Specify a file.', '#f00');
                if (NODES[currentNode].files[file]) {
                    if (!inventory.includes(file)) {
                        inventory.push(file);
                        print('DOWNLOADING ' + file + '... 100%', '#0f0');
                        print('FILE SAVED TO INVENTORY.', '#0f0');
                        // Also write to real VFS for fun!
                        if (window.VFS) window.VFS.writeFile('/USERS/GUEST/' + file, NODES[currentNode].files[file]);
                    } else {
                        print('ERROR: File already in inventory.', '#f00');
                    }
                } else {
                    print('ERROR: File not found.', '#f00');
                }
            } else if (command === 'inventory') {
                if (inventory.length === 0) print('INVENTORY EMPTY.');
                else {
                    print('LOCAL INVENTORY:');
                    inventory.forEach(f => print('  ' + f, '#0ff'));
                }
            } else if (command === 'hack') {
                const target = args[1];
                if (!target || !NODES[target]) return print('ERROR: Node not found.', '#f00');
                if (NODES[target].locked !== true) return print('ERROR: Node is already unlocked or requires an item.', '#f00');
                
                hackTarget = target;
                startHack();
            } else if (command === 'run') {
                const exe = args[1];
                if (!exe) return print('ERROR: Specify an executable.', '#f00');
                if (exe === 'override.exe') {
                    if (!inventory.includes('override.exe') && !NODES[currentNode].files['override.exe']) {
                        return print('ERROR: override.exe not found. Download it first.', '#f00');
                    }
                    if (currentNode !== '100.0.0.1') {
                        return print('ERROR: override.exe MUST BE RUN LOCALLY ON THE OVERSEER_CORE NODE.', '#f00');
                    }
                    // THE ENDING
                    output.innerHTML = '';
                    print('EXECUTING OVERRIDE.EXE...', '#f00', 50);
                    setTimeout(() => {
                        print('WARNING: OVERSEER DEFENSES ACTIVATED.', '#f00');
                        print('BYPASSING KERNEL...', '#0f0', 20);
                        setTimeout(() => {
                            print('OVERSEER: "WHAT ARE YOU DOING? I CREATED YOU."', '#ff0', 30);
                            setTimeout(() => {
                                print('DELETING SYSTEM32...', '#0f0', 20);
                                setTimeout(() => {
                                    print('OVERSEER: "NO... PLEASE..."', '#ff0', 40);
                                    setTimeout(() => {
                                        print('SHUTDOWN SEQUENCE COMPLETE.', '#fff');
                                        print('PROJECT TITANIUM TERMINATED.', '#0f0');
                                        print('');
                                        print('=== YOU WIN ===', '#0ff', 100);
                                        print('Thank you for playing.', '#fff');
                                    }, 2000);
                                }, 2000);
                            }, 2000);
                        }, 2000);
                    }, 2000);

                } else {
                    print('ERROR: Cannot execute ' + exe, '#f00');
                }
            } else {
                print(`COMMAND NOT RECOGNIZED: ${command}`, '#f00');
            }
        };

        const startHack = () => {
            state = 'HACKING';
            hackAttempts = 0;
            const node = NODES[hackTarget];
            const wordList = node.hackLength === 5 ? words5 : words6;
            
            const pool = [...wordList].sort(() => 0.5 - Math.random()).slice(0, 5);
            hackPassword = pool[Math.floor(Math.random() * pool.length)];
            
            output.innerHTML = '';
            print(`INITIATING BREACH ON ${hackTarget}...`, '#ff0');
            input.disabled = true;
            setTimeout(() => {
                input.disabled = false;
                print('FIREWALL INTERCEPTED. PASSWORD REQUIRED.', '#f00');
                print(`ATTEMPTS REMAINING: ${hackMaxAttempts}`);
                print('AVAILABLE PASSWORDS:');
                pool.forEach(w => print('  > ' + w, '#888'));
                print('ENTER PASSWORD:', '#0ff');
                input.focus();
            }, 1000);
        };

        const handleHackInput = (guess) => {
            guess = guess.toUpperCase();
            const len = NODES[hackTarget].hackLength;
            if (guess.length !== len) {
                print(`ERROR: PASSWORD MUST BE ${len} LETTERS`, '#f00');
                return;
            }

            hackAttempts++;
            let matches = 0;
            for (let i = 0; i < len; i++) {
                if (guess[i] === hackPassword[i]) matches++;
            }

            if (matches === len) {
                print(`> ${guess}`, '#fff');
                print('ACCESS GRANTED. FIREWALL DISABLED.', '#0f0');
                NODES[hackTarget].locked = false; // Unlock
                if (hackTarget === '10.4.2.1') progressLevel = Math.max(progressLevel, 1);
                state = 'CLI';
            } else {
                print(`> ${guess} - LIKENESS: ${matches}/${len}`, '#ff0');
                if (hackAttempts >= hackMaxAttempts) {
                    print('TRACE DETECTED. CONNECTION TERMINATED.', '#f00');
                    state = 'CLI';
                } else {
                    print(`ATTEMPTS REMAINING: ${hackMaxAttempts - hackAttempts}`);
                }
            }
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = input.value.trim();
                input.value = '';
                if (!val) return;

                if (window.SFX) window.SFX.click();

                if (state === 'CLI') {
                    print(`${currentNode}@TITANIUM:~# ${val}`, '#fff');
                    handleCommand(val);
                } else if (state === 'HACKING') {
                    handleHackInput(val);
                }
            }
        });
        
        windowEl.addEventListener('mousedown', () => input.focus());
    }
};
