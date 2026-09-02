window.VFS = {
    fs: {
        'SYSTEM': {
            'kernel.sys': '01001011 01000101 01010010 01001110 01000101 01001100',
            'boot.ini': 'OS_MODE=CYBER\nBOOT_SPEED=FAST\nDEBUG=0',
            'drivers': {
                'video.drv': '[VIDEO DRIVER DATA]',
                'audio.drv': '[AUDIO DRIVER DATA]'
            }
        },
        'USERS': {
            'GUEST': {
                'documents': {
                    'readme.txt': 'Welcome to CYBER-NEXUS.\nThis is a fully functional Virtual File System (VFS).\nYou can edit this file and save it, or create new files and folders.',
                    'todo.txt': '- Hack the mainframe\n- Evade the grid\n- Save the files'
                },
                'logs': {
                    'sys.log': 'SYSTEM BOOT SUCCESSFUL.\nNO ERRORS DETECTED.'
                }
            }
        }
    },

    resolvePath: function(currentPath, target) {
        if (target === '..') {
            const parts = currentPath.split('/').filter(p => p !== '');
            parts.pop();
            return parts.length === 0 ? '/' : '/' + parts.join('/');
        }
        if (target.startsWith('/')) return target;
        if (currentPath === '/') return '/' + target;
        return currentPath + '/' + target;
    },

    getNode: function(path) {
        if (path === '/') return this.fs;
        const parts = path.split('/').filter(p => p !== '');
        let node = this.fs;
        for (let part of parts) {
            if (node[part] !== undefined) {
                node = node[part];
            } else {
                return null;
            }
        }
        return node;
    },

    readDir: function(path) {
        const node = this.getNode(path);
        if (typeof node === 'object' && node !== null) {
            return Object.keys(node).map(key => ({
                name: key,
                type: typeof node[key] === 'object' && node[key] !== null ? 'dir' : 'file'
            }));
        }
        return [];
    },

    readFile: function(path) {
        const node = this.getNode(path);
        if (typeof node === 'string') {
            return node;
        }
        return null;
    },

    writeFile: function(path, content) {
        const parts = path.split('/').filter(p => p !== '');
        if (parts.length === 0) return false;
        
        const fileName = parts.pop();
        const dirPath = '/' + parts.join('/');
        const dirNode = this.getNode(dirPath);
        
        if (typeof dirNode === 'object' && dirNode !== null) {
            dirNode[fileName] = content;
            return true;
        }
        return false;
    },

    mkdir: function(path) {
        const parts = path.split('/').filter(p => p !== '');
        if (parts.length === 0) return false;
        
        const dirName = parts.pop();
        const parentPath = '/' + parts.join('/');
        const parentNode = this.getNode(parentPath);
        
        if (typeof parentNode === 'object' && parentNode !== null) {
            if (parentNode[dirName] === undefined) {
                parentNode[dirName] = {};
                return true;
            }
        }
        return false;
    }
};
