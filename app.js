

class RealityKernel {
    constructor() {
        this.session = JSON.parse(localStorage.getItem('R_SYS_SESSION')) || null;
        this.db = {
            posts: JSON.parse(localStorage.getItem('R_SYS_POSTS')) || this.loadSeedData(),
            apps: [],
            windows: new Map(),
            following: new Set(JSON.parse(localStorage.getItem('R_SYS_FOLLOW')) || [])
        };
        
        this.config = {
            accent: '#00d2ff',
            darkMode: true,
            storageLimit: 1024 * 1024 * 5 // 5MB simulated
        };

        this.boot();
    }

    async boot() {
        const log = document.getElementById('boot-log');
        const delay = (ms) => new Promise(res => setTimeout(res, ms));

        await delay(500); log.innerText = "LOADING SECURITY PROTOCOLS...";
        await delay(400); log.innerText = "MOUNTING VIRTUAL DISK...";
        await delay(600); log.innerText = "ESTABLISHING REALITY-LINK...";
        
        document.getElementById('kernel-loader').classList.add('hidden');
        this.initDOM();
        this.attachListeners();
        
        if (this.session) {
            this.unlockInterface();
        }
    }

    initDOM() {
        this.workspace = document.getElementById('view-layer');
        this.windowLayer = document.getElementById('window-layer');
        this.userDisplay = document.getElementById('display-name');
        this.clock = document.getElementById('os-clock');
        
        setInterval(() => {
            const now = new Date();
            this.clock.innerText = now.getHours().toString().padStart(2,'0') + ":" + now.getMinutes().toString().padStart(2,'0');
        }, 1000);
    }

    attachListeners() {
        document.getElementById('start-btn').onclick = () => this.authenticate();
        document.getElementById('shutdown-btn').onclick = () => this.shutdown();
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.onclick = () => {
                const view = btn.dataset.view;
                this.navigate(view);
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            };
        });

        // Admin Auth
        document.getElementById('admin-unlock').onclick = () => {
            if (document.getElementById('admin-pass').value === 'packers') {
                document.getElementById('admin-gate').classList.add('hidden');
                this.renderSnackPack();
            } else alert("INVALID CREDENTIALS");
        };

        // Simulated File Upload
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('sys-file-input')) {
                this.handleInternalUpload(e.target);
            }
        });
    }

    authenticate() {
        const name = document.getElementById('username-input').value.trim();
        if (!name) return;
        
        this.session = {
            user: this.sanitize(name),
            uid: 'R-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            joined: new Date().toISOString()
        };
        
        localStorage.setItem('R_SYS_SESSION', JSON.stringify(this.session));
        this.unlockInterface();
    }

    unlockInterface() {
        document.getElementById('splash-screen').classList.add('hidden');
        document.getElementById('os-interface').classList.remove('hidden');
        this.userDisplay.innerText = this.session.user;
        this.navigate('feed');
        this.initBackgroundEffect();
    }

    shutdown() {
        localStorage.clear();
        location.reload();
    }

    // --- NAVIGATION ENGINE ---
    navigate(view) {
        if (view === 'snackpack') {
            document.getElementById('admin-gate').classList.remove('hidden');
            return;
        }
        
        this.workspace.innerHTML = '';
        switch(view) {
            case 'feed': this.renderFeed(); break;
            case 'apps': this.renderAppStation(); break;
            case 'profile': this.renderProfile(); break;
            case 'tv': this.renderTV(); break;
            case 'settings': this.renderSettings(); break;
            case 'communities': this.renderCommunities(); break;
        }
    }

    // --- RENDERERS ---
    renderFeed() {
        const ui = `
            <div class="feed-container">
                <div class="composer-aero glass-morph" style="padding:25px; margin-bottom:30px;">
                    <textarea id="p-content" placeholder="Broadcast a thought to reality..."></textarea>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px;">
                        <div class="upload-zone">
                            <label for="f-up" class="aero-btn" style="background:#333">ATTACH DATA</label>
                            <input type="file" id="f-up" class="sys-file-input" style="display:none">
                            <span id="f-name" style="font-size:12px; margin-left:10px;"></span>
                        </div>
                        <button class="aero-btn" onclick="Reality.broadcast()">BROADCAST</button>
                    </div>
                </div>
                <div id="os-feed-list"></div>
            </div>
        `;
        this.workspace.innerHTML = ui;
        this.updateFeedList();
    }

    updateFeedList() {
        const list = document.getElementById('os-feed-list');
        list.innerHTML = '';
        this.db.posts.slice().reverse().forEach(post => {
            const div = document.createElement('div');
            div.className = 'feed-post glass-morph';
            div.innerHTML = `
                <div class="post-meta" style="display:flex; justify-content:space-between; margin-bottom:15px;">
                    <span style="font-weight:bold; color:var(--accent)">${this.sanitize(post.author)}</span>
                    <span style="font-size:11px; opacity:0.6">${new Date(post.date).toLocaleDateString()}</span>
                </div>
                <div class="post-body" style="font-size:1.1rem; line-height:1.5;">${this.sanitize(post.content)}</div>
                ${post.data ? `<div class="post-attachment" style="margin-top:15px;"><img src="${post.data}" style="max-width:100%; border-radius:10px;"></div>` : ''}
                <div class="comment-layer" style="margin-top:20px; border-top:1px solid rgba(255,255,255,0.1); padding-top:15px;">
                    ${post.comments.map(c => `<div class="bubble-comment">${this.sanitize(c)}</div>`).join('')}
                    <input type="text" class="com-in" placeholder="Reply..." style="width:100%; margin-top:10px;" onkeypress="if(event.key==='Enter') Reality.addComment(${post.id}, this.value)">
                </div>
            `;
            list.appendChild(div);
        });
    }

    // --- SYSTEM LOGIC ---
    broadcast() {
        const content = document.getElementById('p-content').value;
        if (!content) return;
        if (/\p{Extended_Pictographic}/u.test(content)) {
            alert("SECURITY ALERT: UNKNOWN CHARACTER DETECTED (EMOJI). BROADCAST ABORTED.");
            return;
        }

        const post = {
            id: Date.now(),
            author: this.session.user,
            content: content,
            date: new Date().toISOString(),
            data: this.pendingData || null,
            comments: []
        };

        this.db.posts.push(post);
        this.saveDB();
        this.pendingData = null;
        this.renderFeed();
    }

    handleInternalUpload(input) {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.pendingData = e.target.result;
            document.getElementById('f-name').innerText = file.name + " MOUNTED";
        };
        reader.readAsDataURL(file);
    }

    // --- GAME ENGINE: HYPER-SPEED TUNNEL (Actual 3D Logic) ---
    launchGame() {
        this.openWindow('VOID RUNNER 3D', '<canvas id="game-canvas"></canvas><div id="score-ui">SPEED: 0KM/H</div>', 800);
        this.init3DGame();
    }

    init3DGame() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let speed = 0;
        let pos = 0;
        let obstacles = [];
        
        const loop = () => {
            if (!document.getElementById('game-canvas')) return;
            speed += 0.01;
            pos += speed;
            
            ctx.fillStyle = '#000';
            ctx.fillRect(0,0, canvas.width, canvas.height);
            
            // Draw pseudo-3D tunnel lines
            ctx.strokeStyle = '#00d2ff';
            ctx.lineWidth = 2;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            for (let i = 0; i < 10; i++) {
                let z = ((i * 100 - pos) % 1000 + 1000) % 1000;
                let scale = 500 / z;
                if (scale < 0) continue;
                
                let size = 200 * scale;
                ctx.strokeRect(centerX - size/2, centerY - size/2, size, size);
            }
            
            document.getElementById('score-ui').innerText = `VELOCITY: ${Math.floor(speed * 100)} KM/H`;
            requestAnimationFrame(loop);
        };
        loop();
    }

    // --- WINDOW MANAGER ---
    openWindow(title, html, width = 500) {
        const id = 'win_' + Date.now();
        const win = document.createElement('div');
        win.className = 'window-3d glass-morph';
        win.id = id;
        win.style.width = width + 'px';
        win.style.left = '300px';
        win.style.top = '100px';
        win.style.zIndex = 1000 + this.db.windows.size;
        
        win.innerHTML = `
            <div class="window-header">
                <span>${title}</span>
                <button onclick="document.getElementById('${id}').remove()" style="background:red; border:none; color:white; width:20px; cursor:pointer;">X</button>
            </div>
            <div class="window-content" style="padding:15px;">${html}</div>
        `;
        
        document.getElementById('window-layer').appendChild(win);
        this.makeDraggable(win);
        this.db.windows.set(id, title);
    }

    makeDraggable(el) {
        let p1=0, p2=0, p3=0, p4=0;
        el.querySelector('.window-header').onmousedown = (e) => {
            p3 = e.clientX; p4 = e.clientY;
            document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
            document.onmousemove = (e) => {
                p1 = p3 - e.clientX; p2 = p4 - e.clientY;
                p3 = e.clientX; p4 = e.clientY;
                el.style.top = (el.offsetTop - p2) + "px";
                el.style.left = (el.offsetLeft - p1) + "px";
                // Add slight 3D tilt
                el.style.transform = `rotateY(${p1 * 0.5}deg) rotateX(${p2 * -0.5}deg)`;
            };
        };
    }

    // --- SECURITY & UTILS ---
    sanitize(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    saveDB() {
        localStorage.setItem('R_SYS_POSTS', JSON.stringify(this.db.posts));
    }

    loadSeedData() {
        return [{ id: 1, author: 'OS_KERNEL', content: 'REALITY_OS v4.0.0 Online. Secure link established.', date: new Date().toISOString(), comments: ["STABLE BUILD."] }];
    }

    initBackgroundEffect() {
        const canvas = document.getElementById('background-waves');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const draw = () => {
            ctx.fillStyle = 'rgba(5, 10, 15, 0.1)';
            ctx.fillRect(0,0, canvas.width, canvas.height);
            // Animated grid or waves here...
            requestAnimationFrame(draw);
        };
        draw();
    }

    renderAppStation() {
        this.workspace.innerHTML = `<h1>SYSTEM_APPS</h1><div class="apps-grid" id="agrid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap:20px; margin-top:30px;"></div>`;
        const apps = [
            {n:'VOID_RUNNER', i:'🚀', fn:()=>this.launchGame()},
            {n:'TERMINAL', i:'⌨', fn:()=>this.openWindow('TERMINAL', '<div style="background:#000; color:#0f0; padding:10px; font-family:monospace;">ROOT@REALITY:~# </div>')},
            {n:'PLAYER', i:'🎵', fn:()=>this.openWindow('MEDIA_PLAYER', '<p>Select local file to play...</p>')},
            {n:'VAULT', i:'💎', fn:()=>this.openWindow('SECURE_VAULT', '<p>Encryption Active.</p>')},
        ];
        
        const grid = document.getElementById('agrid');
        for(let i=0; i<60; i++){
            const a = apps[i % apps.length];
            const d = document.createElement('div');
            d.className = 'glass-morph';
            d.style.padding = '20px';
            d.style.textAlign = 'center';
            d.style.cursor = 'pointer';
            d.innerHTML = `<div style="font-size:2rem;">${a.i}</div><div style="font-size:0.6rem; font-weight:bold; margin-top:5px;">${a.n}</div>`;
            d.onclick = a.fn;
            grid.appendChild(d);
        }
    }
}

window.Reality = new RealityKernel();

